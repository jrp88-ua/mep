use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

use calamine::{Data, DataType, Reader};
use serde::{Deserialize, Serialize};
use tauri::{command, AppHandle, Wry};

use crate::ctx::ApplicationContext;

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SheetData {
    name: String,
    values: Vec<Vec<String>>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExamineeImportSettings {
    selected_sheet: String,
    first_row_is_header: bool,
    group_rows_by_column: usize,

    court_column: usize,
    subject_name_column: usize,
    surenames_column: usize,
    name_column: usize,
    nif_column: usize,
    subject_kind_column: usize,
    origin_column: usize,
    academic_centre_column: usize,
}

#[derive(Serialize, Clone, Copy)]
#[serde(rename_all = "camelCase")]
pub struct ExamineeImportResult {
    imported_examinees: usize,
    imported_subjects: usize,
    imported_academic_centres: usize,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub enum ExamineeImportError {
    Lock,
    NoValuesLoaded,
    NoSheet,
    MissingSubjectName { row: usize },
}

#[derive(Default)]
struct ExamineeForImport {
    name: Option<String>,
    nif: Option<String>,
    surenames: Option<String>,
    origin: Option<String>,
    court: Option<i16>,
    academic_centre: Option<String>,
}

#[command]
pub async fn start_examinee_import_process(
    state: tauri::State<'_, Arc<Mutex<Option<Vec<SheetData>>>>>,
    file_path: String,
) -> Result<Vec<SheetData>, String> {
    use calamine::Error;
    let open_result = calamine::open_workbook_auto(file_path);
    if let Err(err) = open_result {
        return Err(match err {
            Error::Io(_) => "IO",
            Error::De(_) => "DE",
            Error::Msg(_) => "MSG",
            Error::Ods(_) => "ODS",
            Error::Vba(_) => "VBA",
            Error::Xls(_) => "XLS",
            Error::Xlsb(_) => "XLSB",
            Error::Xlsx(_) => "XLSX",
        }
        .to_owned());
    }
    let mut sheets = open_result.unwrap();
    let work_sheets = sheets.worksheets();
    let sheet_data: Vec<SheetData> = work_sheets
        .iter()
        .map(|sheet| {
            let name = sheet.0.clone();
            let values = sheet
                .1
                .cells()
                .into_iter()
                .filter_map(|cell| match cell.2 {
                    Data::Empty | Data::Error(_) => None,
                    _ => Some((cell.0, cell.1, cell.2.as_string().unwrap_or("".to_owned()))),
                })
                .fold(Vec::new(), |mut acc, cell| {
                    if acc.len() <= cell.0 {
                        acc.resize(cell.0 + 1, Vec::new());
                    }
                    let row = acc.get_mut(cell.0).unwrap();
                    if row.len() <= cell.1 {
                        row.resize(cell.1 + 1, "".to_owned());
                    }
                    row[cell.1] = cell.2;
                    acc
                });
            SheetData { name, values }
        })
        .collect();
    match state.lock() {
        Ok(mut v) => {
            *v = Option::Some(sheet_data.clone());
            Ok(sheet_data)
        }
        Err(_) => Err("LOCK".to_owned()),
    }
}

#[command]
pub async fn perform_examinee_import(
    state: tauri::State<'_, Arc<Mutex<Option<Vec<SheetData>>>>>,
    app_handle: AppHandle<Wry>,
    import_settings: ExamineeImportSettings,
) -> Result<ExamineeImportResult, ExamineeImportError> {
    let sheet = extract_import_examinees_state(state)?;
    let sheet = sheet
        .iter()
        .find(|sheet| sheet.name == import_settings.selected_sheet)
        .ok_or(ExamineeImportError::NoSheet)?;

    let mut result = ExamineeImportResult {
        imported_examinees: 0,
        imported_subjects: 0,
        imported_academic_centres: 0,
    };
    let start_index = if import_settings.first_row_is_header {
        1
    } else {
        0
    };

    let context = ApplicationContext::from_app(app_handle);

    let mut subjects = HashMap::new();
    for subject in context.state().lock().unwrap().get_all_subjects() {
        subjects.insert(subject.name, subject.kind);
    }

    let mut examinees = HashMap::<String, ExamineeForImport>::new();

    for i in start_index..sheet.values.len() {
        let row = &sheet.values[i];

        let row_subject_name = row
            .get(import_settings.subject_name_column)
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .ok_or(ExamineeImportError::MissingSubjectName { row: i })?;
    }

    Ok(result)
}

#[command]
pub fn cancel_examinee_import(state: tauri::State<Arc<Mutex<Option<Vec<SheetData>>>>>) {
    let _ = extract_import_examinees_state(state);
}

fn extract_import_examinees_state(
    state: tauri::State<Arc<Mutex<Option<Vec<SheetData>>>>>,
) -> Result<Vec<SheetData>, ExamineeImportError> {
    match state.lock() {
        Ok(mut guard) => {
            let values = guard.take().ok_or(ExamineeImportError::NoValuesLoaded)?;
            Ok(values)
        }
        Err(_) => Err(ExamineeImportError::Lock),
    }
}

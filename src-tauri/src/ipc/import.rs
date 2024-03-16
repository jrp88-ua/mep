use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

use calamine::{Data, DataType, Reader};
use serde::{Deserialize, Serialize};
use tauri::{command, AppHandle, Wry};

use crate::{
    ctx::ApplicationContext,
    models::{examinee::ExamineeForCreate, subject::SubjectForCreate, RepositoryEntity},
};

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
    name_column: usize,
    surenames_column: usize,
    origin_column: usize,
    court_column: usize,
    academic_centre_column: usize,
    subjects_column: usize,
}

#[derive(Serialize, Clone, Copy)]
#[serde(rename_all = "camelCase")]
pub struct ExamineeImportResult {
    imported_examinees: usize,
}

#[derive(Default)]
struct ExamineeForImport {
    name: Option<String>,
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
) -> Result<ExamineeImportResult, String> {
    let values = extract_import_examinees_state(state)?;

    let sheet = values
        .iter()
        .find(|sheet| sheet.name == import_settings.selected_sheet)
        .ok_or_else(|| "NO_SHEET".to_owned())?;

    let mut result = ExamineeImportResult {
        imported_examinees: 0,
    };
    let start_index = if import_settings.first_row_is_header {
        1
    } else {
        0
    };

    let context = ApplicationContext::from_app(app_handle);

    let mut subjects = context.state().lock().unwrap().get_all_subjects();

    let mut examinees = HashMap::<String, ExamineeForImport>::new();
    for i in start_index..sheet.values.len() {
        let row = &sheet.values[i];

        let row_subject_name = row
            .get(import_settings.subjects_column)
            .ok_or_else(|| "MISSUNG_SUBJECT_COLUMN".to_owned())?;
        let found_subject = subjects.iter().find(|s| &s.name == row_subject_name);
        if let None = found_subject {
            subjects.push(
                context
                    .state()
                    .lock()
                    .unwrap()
                    .create_subject(SubjectForCreate {
                        name: row_subject_name.clone(),
                    }),
            );
        }

        let identifier = row
            .get(import_settings.group_rows_by_column)
            .ok_or_else(|| "MISSING_GROUP_BY_COLUMN".to_owned())?;
        let name = row
            .get(import_settings.name_column)
            .ok_or_else(|| "MISSING_NAME_COLUMN".to_owned())?;
        let surenames = row
            .get(import_settings.surenames_column)
            .ok_or_else(|| "MISSING_SURENAMES_COLUMN".to_owned())?;
        let origin = row
            .get(import_settings.origin_column)
            .ok_or_else(|| "MISSING_ORIGIN_COLUMN".to_owned())?;
        let court = row
            .get(import_settings.court_column)
            .ok_or_else(|| "MISSING_COURT_COLUMN".to_owned())?;
        let academic_centre = row
            .get(import_settings.academic_centre_column)
            .ok_or_else(|| "MISSING_ACADEMIC_CENTRE_COLUMN".to_owned())?;

        let mut examinee = examinees.get_mut(identifier);
        if let Option::None = examinee {
            examinees.insert(identifier.clone(), ExamineeForImport::default());
            examinee = examinees.get_mut(identifier);
        }
        let examinee = examinee.unwrap();

        match &examinee.name {
            Some(ex_name) => {
                if name != ex_name {
                    return Err("DIFFERENT_NAMES".to_owned());
                }
            }
            None => examinee.name = Some(name.clone()),
        };

        match &examinee.surenames {
            Some(ex_surenames) => {
                if surenames != ex_surenames {
                    return Err("DIFFERENT_SURENAMES".to_owned());
                }
            }
            None => examinee.surenames = Some(surenames.clone()),
        };

        match &examinee.origin {
            Some(ex_origin) => {
                if origin != ex_origin {
                    return Err("DIFFERENT_ORIGINS".to_owned());
                }
            }
            None => examinee.origin = Some(origin.clone()),
        };

        let court = court.parse::<i16>();
        let court = match court {
            Ok(v) => Result::Ok(v),
            Err(_) => Result::Err("COURT_NUMBER_IS_NOT_INT".to_owned()),
        }?;

        match &examinee.court {
            Some(ex_court) => {
                if &court != ex_court {
                    return Err("DIFFERENT_COURTS".to_owned());
                }
            }
            None => examinee.court = Some(court),
        };

        match &examinee.academic_centre {
            Some(ex_academic_centre) => {
                if academic_centre != ex_academic_centre {
                    return Err("DIFFERENT_ACADEMIC_CENTRES".to_owned());
                }
            }
            None => examinee.academic_centre = Some(academic_centre.clone()),
        };
    }

    result.imported_examinees = examinees.len();
    for examinee in examinees {
        let academic_centre_for_create = examinee.1.academic_centre.map(|academic_centre_name| {
            context
                .state()
                .lock()
                .unwrap()
                .get_or_create_academic_centre(academic_centre_name)
                .id()
        });

        let to_create = ExamineeForCreate {
            name: examinee
                .1
                .name
                .clone()
                .ok_or_else(|| "MISSING_NAME".to_owned())?,
            surenames: examinee
                .1
                .surenames
                .clone()
                .ok_or_else(|| "MISSING_SURENAMES".to_owned())?,
            origin: examinee
                .1
                .origin
                .clone()
                .ok_or_else(|| "MISSING_ORIGIN".to_owned())?,
            court: examinee
                .1
                .court
                .clone()
                .ok_or_else(|| "MISSING_COURT".to_owned())?,
            academic_centre: academic_centre_for_create,
        };
        context.state().lock().unwrap().create_examinee(to_create);
    }

    Ok(result)
}

#[command]
pub fn cancel_examinee_import(state: tauri::State<Arc<Mutex<Option<Vec<SheetData>>>>>) {
    let _ = extract_import_examinees_state(state);
}

fn extract_import_examinees_state(
    state: tauri::State<Arc<Mutex<Option<Vec<SheetData>>>>>,
) -> Result<Vec<SheetData>, String> {
    match state.lock() {
        Ok(mut guard) => {
            let values = guard.take().ok_or_else(|| "NO_VALUES".to_owned())?;
            Ok(values)
        }
        Err(_) => Err("LOCK".to_owned()),
    }
}

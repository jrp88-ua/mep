use std::{
    collections::{HashMap, HashSet},
    sync::{Arc, Mutex},
};

use calamine::{Data, DataType, Reader};
use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;
use tauri::{command, AppHandle, Wry};
use ts_rs::TS;

use crate::{
    ctx::{ApplicationContext, ApplicationState},
    models::{
        academic_centre::AcademicCentreForCreate,
        examinee::ExamineeForCreate,
        subject::{SubjectForCreate, SubjectKind},
    },
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

    court_column: usize,
    subject_name_column: usize,
    surenames_column: usize,
    name_column: usize,
    nif_column: usize,
    subject_kind_column: usize,
    origin_column: usize,
    academic_centre_column: usize,
}

#[derive(Serialize, Clone, Copy, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../../src/lib/types/generated/")]
pub struct ExamineeImportResult {
    imported_examinees: usize,
    imported_subjects: usize,
    imported_academic_centres: usize,
}

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../../src/lib/types/generated/")]
pub enum ExamineeImportColumn {
    SubjectName,
    RowIdentifier,
    ExamineeNif,
    ExamineeName,
    ExamineeSurenames,
    ExamineeOrigin,
    ExamineeCourt,
    ExamineeAcademicCentre,
}

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../../src/lib/types/generated/")]
pub enum ExamineeImportInvalidValueError {
    CourtIsNotNumber,
}

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase", tag = "type")]
#[ts(export, export_to = "../../src/lib/types/generated/")]
pub enum ExamineeImportError {
    Lock,
    NoValuesLoaded,
    NoSheet,
    MissingValue {
        row: usize,
        missing: ExamineeImportColumn,
    },
    #[serde(rename_all = "camelCase")]
    MissmatchValue {
        row: usize,
        identifier: String,
        missmatch: ExamineeImportColumn,
        established_value: String,
        found_value: String,
    },
    #[serde(rename_all = "camelCase")]
    InvalidValue {
        row: usize,
        reason: ExamineeImportInvalidValueError,
        invalid_value: String,
    },
    MissingExamineeValue {
        examinee: ExamineeForImport,
        identifier: String,
        missing: ExamineeImportColumn,
    },
}

#[skip_serializing_none]
#[derive(Serialize, Default, Clone, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../../src/lib/types/generated/")]
pub struct ExamineeForImport {
    identifier: String,
    nif: Option<String>,
    name: Option<String>,
    surenames: Option<String>,
    origin: Option<String>,
    court: Option<i16>,
    academic_centre: Option<String>,
    subjects: HashSet<String>,
}

impl ExamineeForImport {
    fn into_create(
        self,
        state: &ApplicationState,
    ) -> Result<ExamineeForCreate, ExamineeImportError> {
        let nif = self
            .clone()
            .nif
            .ok_or_else(|| ExamineeImportError::MissingExamineeValue {
                examinee: self.clone(),
                identifier: self.clone().identifier,
                missing: ExamineeImportColumn::ExamineeNif,
            })?
            .clone();
        let name = self
            .clone()
            .name
            .ok_or_else(|| ExamineeImportError::MissingExamineeValue {
                examinee: self.clone(),
                identifier: self.clone().identifier,
                missing: ExamineeImportColumn::ExamineeName,
            })?
            .clone();
        let surenames = self.clone().surenames.unwrap_or_default();
        let origin = self
            .clone()
            .origin
            .ok_or_else(|| ExamineeImportError::MissingExamineeValue {
                examinee: self.clone(),
                identifier: self.clone().identifier,
                missing: ExamineeImportColumn::ExamineeOrigin,
            })?
            .clone();
        let court = self
            .clone()
            .court
            .ok_or_else(|| ExamineeImportError::MissingExamineeValue {
                examinee: self.clone(),
                identifier: self.clone().identifier,
                missing: ExamineeImportColumn::ExamineeCourt,
            })?
            .clone();
        let academic_centre_id = self
            .clone()
            .academic_centre
            .and_then(|name| state.get_academic_centre_by_name(name))
            .map(|ac| ac.id.clone());
        Ok(ExamineeForCreate {
            nif,
            name,
            surenames,
            origin,
            court,
            academic_centre_id,
        })
    }
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

    let mut academic_centres = HashSet::new();
    for academic_centre in context.state().lock().unwrap().get_all_academic_centres() {
        academic_centres.insert(academic_centre.name);
    }

    let mut examinees = HashMap::<String, ExamineeForImport>::new();

    for i in start_index..sheet.values.len() {
        let row = &sheet.values[i];

        let row_subject = update_subjects_list(&mut subjects, &row, i, &import_settings)?;
        let row_academic_centre =
            update_academic_centres_list(&mut academic_centres, &row, &import_settings);

        update_examinee_list(
            &mut examinees,
            &row_academic_centre,
            &row_subject,
            &row,
            i,
            &import_settings,
        )?;
    }

    if let Ok(mut state) = context.state().lock() {
        let undo_subjects =
            state.bulk_create_subjects(subjects.iter().map(|(name, kind)| SubjectForCreate {
                name: name.clone(),
                kind: kind.clone(),
            }));

        let undo_academic_centres = state.bulk_create_academic_centres(
            academic_centres
                .iter()
                .map(|name| AcademicCentreForCreate { name: name.clone() }),
        );

        let examinees = examinees
            .into_values()
            .map(|e| {
                let r: Result<ExamineeForCreate, ExamineeImportError> = e.into_create(&*state);
                r
            })
            .collect::<Result<Vec<ExamineeForCreate>, _>>()?;
        let undo_examinees = state.bulk_create_examinees(examinees.into_iter());
    } else {
        return Err(ExamineeImportError::Lock);
    }

    Ok(result)
}

fn update_subjects_list(
    subjects: &mut HashMap<String, SubjectKind>,
    row: &Vec<String>,
    index: usize,
    settings: &ExamineeImportSettings,
) -> Result<String, ExamineeImportError> {
    let subject_name = row
        .get(settings.subject_name_column)
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .ok_or(ExamineeImportError::MissingValue {
            row: index,
            missing: ExamineeImportColumn::SubjectName,
        })?;

    if *subjects.get(subject_name).unwrap_or(&SubjectKind::UNKNOWN) == SubjectKind::UNKNOWN {
        let subject_kind = row
            .get(settings.subject_kind_column)
            .map(|s| s.trim())
            .map_or(SubjectKind::UNKNOWN, SubjectKind::from);

        subjects.insert(subject_name.to_owned(), subject_kind);
    }

    Ok(subject_name.to_owned())
}

fn update_academic_centres_list(
    academic_centres: &mut HashSet<String>,
    row: &Vec<String>,
    settings: &ExamineeImportSettings,
) -> Option<String> {
    let academic_centre_name = row
        .get(settings.academic_centre_column)
        .map(|s| s.trim())
        .filter(|s| !s.is_empty());

    if academic_centre_name.is_none() {
        return None;
    }

    let academic_centre_name = academic_centre_name.unwrap();

    if !academic_centres.contains(academic_centre_name) {
        academic_centres.insert(academic_centre_name.to_owned());
    }

    Some(academic_centre_name.to_owned())
}

struct ExamineeRowValues<'a> {
    nif: &'a String,
    name: &'a String,
    surenames: String,
    origin: &'a String,
    court: i16,
    identifier: &'a String,
}
fn extract_examinee_values_from_row<'a>(
    row: &'a Vec<String>,
    index: usize,
    settings: &ExamineeImportSettings,
) -> Result<ExamineeRowValues<'a>, ExamineeImportError> {
    let identifier = row
        .get(settings.group_rows_by_column)
        .filter(|s| !s.is_empty())
        .ok_or_else(|| ExamineeImportError::MissingValue {
            row: index,
            missing: ExamineeImportColumn::RowIdentifier,
        })?;
    let nif = row
        .get(settings.nif_column)
        .filter(|s| !s.is_empty())
        .ok_or_else(|| ExamineeImportError::MissingValue {
            row: index,
            missing: ExamineeImportColumn::ExamineeNif,
        })?;
    let name = row
        .get(settings.name_column)
        .filter(|s| !s.is_empty())
        .ok_or_else(|| ExamineeImportError::MissingValue {
            row: index,
            missing: ExamineeImportColumn::ExamineeName,
        })?;
    let surenames = match row.get(settings.surenames_column) {
        Some(surenames) => surenames,
        None => "",
    }
    .to_owned();
    let origin = row
        .get(settings.origin_column)
        .filter(|s| !s.is_empty())
        .ok_or_else(|| ExamineeImportError::MissingValue {
            row: index,
            missing: ExamineeImportColumn::ExamineeOrigin,
        })?;
    let court = row
        .get(settings.court_column)
        .filter(|s| !s.is_empty())
        .ok_or_else(|| ExamineeImportError::MissingValue {
            row: index,
            missing: ExamineeImportColumn::ExamineeCourt,
        })?
        .parse::<i16>()
        .map_err(|_| ExamineeImportError::InvalidValue {
            row: index,
            invalid_value: row[settings.court_column].to_owned(),
            reason: ExamineeImportInvalidValueError::CourtIsNotNumber,
        })?;
    Ok(ExamineeRowValues {
        identifier,
        nif,
        name,
        surenames,
        origin,
        court,
    })
}

fn check_and_update_examinee(
    row_examinee: &mut ExamineeForImport,
    row_values: ExamineeRowValues,
    row_subject: &str,
    row_academic_centre: &Option<String>,
    index: usize,
) -> Result<(), ExamineeImportError> {
    if row_examinee
        .nif
        .get_or_insert_with(|| row_values.nif.clone())
        != row_values.nif
    {
        return Err(ExamineeImportError::MissmatchValue {
            row: index,
            identifier: row_values.identifier.clone(),
            missmatch: ExamineeImportColumn::ExamineeNif,
            established_value: row_examinee.nif.clone().unwrap(),
            found_value: row_values.nif.clone(),
        });
    }
    if row_examinee
        .name
        .get_or_insert_with(|| row_values.name.clone())
        != row_values.name
    {
        return Err(ExamineeImportError::MissmatchValue {
            row: index,
            identifier: row_values.identifier.clone(),
            missmatch: ExamineeImportColumn::ExamineeName,
            established_value: row_examinee.name.clone().unwrap(),
            found_value: row_values.name.clone(),
        });
    }

    if *row_examinee
        .surenames
        .get_or_insert_with(|| row_values.surenames.to_owned())
        != row_values.surenames
    {
        return Err(ExamineeImportError::MissmatchValue {
            row: index,
            identifier: row_values.identifier.clone(),
            missmatch: ExamineeImportColumn::ExamineeSurenames,
            established_value: row_examinee.surenames.clone().unwrap(),
            found_value: row_values.surenames.to_owned(),
        });
    }

    if row_examinee
        .origin
        .get_or_insert_with(|| row_values.origin.clone())
        != row_values.origin
    {
        return Err(ExamineeImportError::MissmatchValue {
            row: index,
            identifier: row_values.identifier.clone(),
            missmatch: ExamineeImportColumn::ExamineeOrigin,
            established_value: row_examinee.origin.clone().unwrap(),
            found_value: row_values.origin.clone(),
        });
    }

    if *row_examinee
        .court
        .get_or_insert_with(|| row_values.court.clone())
        != row_values.court
    {
        return Err(ExamineeImportError::MissmatchValue {
            row: index,
            identifier: row_values.identifier.clone(),
            missmatch: ExamineeImportColumn::ExamineeCourt,
            established_value: row_examinee.court.unwrap().to_string(),
            found_value: row_values.court.to_string(),
        });
    }

    if let Option::Some(row_academic_centre) = row_academic_centre {
        if row_examinee
            .academic_centre
            .get_or_insert_with(|| row_academic_centre.clone())
            != row_academic_centre
        {
            return Err(ExamineeImportError::MissmatchValue {
                row: index,
                identifier: row_values.identifier.clone(),
                missmatch: ExamineeImportColumn::ExamineeAcademicCentre,
                established_value: row_examinee.academic_centre.clone().unwrap(),
                found_value: row_academic_centre.clone(),
            });
        }
    }

    row_examinee.subjects.insert(row_subject.to_owned());

    Ok(())
}

fn update_examinee_list(
    examinees: &mut HashMap<String, ExamineeForImport>,
    row_academic_centre: &Option<String>,
    row_subject: &str,
    row: &Vec<String>,
    index: usize,
    settings: &ExamineeImportSettings,
) -> Result<(), ExamineeImportError> {
    let row_values = extract_examinee_values_from_row(row, index, settings)?;

    let mut row_examinee = examinees.get_mut(row_values.identifier);
    if row_examinee.is_none() {
        let mut examinee = ExamineeForImport::default();
        examinee.identifier = row_values.identifier.clone();
        examinees.insert(row_values.identifier.to_owned(), examinee);
        row_examinee = examinees.get_mut(row_values.identifier);
    }
    let row_examinee = row_examinee.unwrap();

    check_and_update_examinee(
        row_examinee,
        row_values,
        row_subject,
        row_academic_centre,
        index,
    )
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

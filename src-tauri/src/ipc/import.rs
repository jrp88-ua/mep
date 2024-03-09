use calamine::{Data, DataType, Reader};
use serde::Serialize;
use tauri::command;

#[command]
pub fn import_verify_excel(file_path: String) -> Result<Vec<SheetData>, String> {
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
    let sheet_data = work_sheets
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
    Ok(sheet_data)
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SheetData {
    name: String,
    values: Vec<Vec<String>>,
}

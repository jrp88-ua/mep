use crate::ctx::ApplicationContext;
use crate::models::examinee::{Examinee, ExamineeForCreate};
use calamine::Reader;
use tauri::{command, AppHandle, Wry};

use super::response::IpcResponse;

#[command]
pub fn examinees_import_verify_file(file_path: String) -> IpcResponse<Vec<String>> {
    use calamine::Error;
    let open_result = calamine::open_workbook_auto(file_path);
    if let Err(err) = open_result {
        return IpcResponse::error(match err {
            Error::Io(_) => "IO",
            Error::De(_) => "DE",
            Error::Msg(_) => "MSG",
            Error::Ods(_) => "ODS",
            Error::Vba(_) => "VBA",
            Error::Xls(_) => "XLS",
            Error::Xlsb(_) => "XLSB",
            Error::Xlsx(_) => "XLSX",
        });
    }
    let sheets = open_result.unwrap();
    IpcResponse::ok(sheets.sheet_names())
}

#[command]
pub fn get_all_examinees(app_handle: AppHandle<Wry>) -> IpcResponse<Vec<Examinee>> {
    IpcResponse::ok(
        ApplicationContext::from_app(app_handle)
            .state()
            .lock()
            .unwrap()
            .get_all_examinees(),
    )
}

#[command]
pub fn create_examinee(
    app_handle: AppHandle<Wry>,
    values: ExamineeForCreate,
) -> IpcResponse<Examinee> {
    IpcResponse::ok(
        ApplicationContext::from_app(app_handle)
            .state()
            .lock()
            .unwrap()
            .create_examinee(values),
    )
}

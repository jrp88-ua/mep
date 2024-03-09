use crate::ctx::ApplicationContext;
use crate::models::examinee::{Examinee, ExamineeForCreate};
use tauri::{command, AppHandle, Wry};

#[command]
pub fn get_all_examinees(app_handle: AppHandle<Wry>) -> Vec<Examinee> {
    ApplicationContext::from_app(app_handle)
        .state()
        .lock()
        .unwrap()
        .get_all_examinees()
}

#[command]
pub fn create_examinee(app_handle: AppHandle<Wry>, values: ExamineeForCreate) -> Examinee {
    ApplicationContext::from_app(app_handle)
        .state()
        .lock()
        .unwrap()
        .create_examinee(values)
}

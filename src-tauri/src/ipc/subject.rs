use crate::ctx::ApplicationContext;
use crate::models::subject::Subject;
use tauri::{command, AppHandle, Wry};

#[command]
pub fn get_all_subjects(app_handle: AppHandle<Wry>) -> Vec<Subject> {
    ApplicationContext::from_app(app_handle)
        .state()
        .lock()
        .unwrap()
        .get_all_subjects()
}

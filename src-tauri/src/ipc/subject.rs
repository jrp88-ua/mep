use crate::models::subject::Subject;
use crate::{ctx::ApplicationContext, models::subject::SubjectForCreate};
use tauri::{command, AppHandle, Wry};

#[command]
pub fn get_all_subjects(app_handle: AppHandle<Wry>) -> Vec<Subject> {
    ApplicationContext::from_app(app_handle)
        .state()
        .lock()
        .unwrap()
        .get_all_subjects()
}

#[command]
pub fn create_subject(app_handle: AppHandle<Wry>, values: SubjectForCreate) -> Subject {
    ApplicationContext::from_app(app_handle)
        .state()
        .lock()
        .unwrap()
        .create_subject(values)
}

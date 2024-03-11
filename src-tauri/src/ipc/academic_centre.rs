use crate::models::academic_centre::AcademicCentre;
use crate::{ctx::ApplicationContext, models::academic_centre::AcademicCentreForCreate};
use tauri::{command, AppHandle, Wry};

#[command]
pub fn get_all_academic_centres(app_handle: AppHandle<Wry>) -> Vec<AcademicCentre> {
    ApplicationContext::from_app(app_handle)
        .state()
        .lock()
        .unwrap()
        .get_all_academic_centres()
}

#[command]
pub fn create_academic_centre(
    app_handle: AppHandle<Wry>,
    values: AcademicCentreForCreate,
) -> AcademicCentre {
    ApplicationContext::from_app(app_handle)
        .state()
        .lock()
        .unwrap()
        .create_academic_centre(values)
}

use std::sync::{Arc, Mutex, MutexGuard};

use tauri::{AppHandle, Manager, Wry};

use crate::models::academic_centre::AcademicCentre;
use crate::models::examinee::Examinee;
use crate::models::subject::Subject;
use crate::models::Repository;

pub struct ApplicationContext {
    state: Arc<Mutex<ApplicationState>>,
}

impl ApplicationContext {
    pub fn from_app(app_handle: AppHandle<Wry>) -> Self {
        ApplicationContext {
            state: (*app_handle.state::<Arc<Mutex<ApplicationState>>>()).clone(),
        }
    }

    pub fn state(&self) -> Arc<Mutex<ApplicationState>> {
        Arc::clone(&self.state)
    }
}

pub struct ApplicationState {
    is_saved: Arc<Mutex<bool>>,
    examinees: Arc<Mutex<Repository<Examinee>>>,
    academic_centres: Arc<Mutex<Repository<AcademicCentre>>>,
    subjects: Arc<Mutex<Repository<Subject>>>,
}

impl ApplicationState {
    pub fn new() -> Self {
        ApplicationState {
            is_saved: Arc::new(Mutex::new(true)),
            examinees: Arc::new(Mutex::new(Repository::new())),
            academic_centres: Arc::new(Mutex::new(Repository::new())),
            subjects: Arc::new(Mutex::new(Repository::new())),
        }
    }

    pub fn get_examinees(&self) -> MutexGuard<'_, Repository<Examinee>> {
        self.examinees.lock().unwrap()
    }

    pub fn get_academic_centres(&self) -> MutexGuard<'_, Repository<AcademicCentre>> {
        self.academic_centres.lock().unwrap()
    }

    pub fn get_subjects(&self) -> MutexGuard<'_, Repository<Subject>> {
        self.subjects.lock().unwrap()
    }

    pub fn modified_state(&self) {
        *self.is_saved.lock().unwrap() = true
    }
}

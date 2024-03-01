use crate::models::examinee::Examinee;
use crate::models::Repository;

pub struct ApplicationState {
    is_saved: bool,
    examinees: Repository<Examinee>,
}

impl ApplicationState {
    pub fn new() -> Self {
        ApplicationState {
            is_saved: true,
            examinees: Repository::new(),
        }
    }

    pub fn get_examinees(&self) -> &Repository<Examinee> {
        &self.examinees
    }

    pub fn get_examinees_mut(&mut self) -> &mut Repository<Examinee> {
        &mut self.examinees
    }

    pub fn is_saved(&self) -> bool {
        self.is_saved
    }

    pub fn modified_state(&mut self) {
        self.is_saved = false
    }
}

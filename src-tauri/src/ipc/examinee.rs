use std::sync::{Arc, Mutex};

use crate::ctx::ApplicationState;
use crate::models::examinee::{Examinee, ExamineeForCreate};
use tauri::{command, State};

use super::response::IpcResponse;

#[command]
pub fn get_all_examinees(state: State<Arc<Mutex<ApplicationState>>>) -> IpcResponse<Vec<Examinee>> {
    IpcResponse::ok(
        state
            .lock()
            .unwrap()
            .get_examinees()
            .get_all()
            .iter()
            .map(|examinee| Examinee::clone(&examinee))
            .collect(),
    )
}

#[command]
pub fn create_examinee(
    state: State<Arc<Mutex<ApplicationState>>>,
    values: ExamineeForCreate,
) -> IpcResponse<Examinee> {
    let mut state = state.lock().unwrap();

    IpcResponse::ok(state.create_examinee(values).clone())
}

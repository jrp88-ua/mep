use log::warn;
use serde::Serialize;
use std::sync::Arc;
use std::{fmt::Debug, sync::Mutex};
use tauri::{AppHandle, Manager, Wry};

use crate::event::ApplicationEvent;
use crate::models::examinee::ExamineeService;

pub struct ApplicationContext {
    app_handle: AppHandle<Wry>,
    examinees: Arc<Mutex<ExamineeService>>,
}

impl ApplicationContext {
    pub fn from_app(app: AppHandle<Wry>) -> Arc<ApplicationContext> {
        Arc::new(ApplicationContext::new(app))
    }

    pub fn new(app_handle: AppHandle<Wry>) -> Self {
        ApplicationContext {
            app_handle,
            examinees: Arc::new(Mutex::new(ExamineeService::new())),
        }
    }

    pub fn emmit_event<D: Serialize + Clone + Debug>(&self, event: ApplicationEvent<D>) {
        let result = self.app_handle.emit_all(event.event.as_str(), &event);

        if let Err(error) = result {
            warn!("Error emmiting event {event:?}: {error}");
        }
    }
}

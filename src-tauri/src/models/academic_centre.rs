use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;

use crate::ctx::ApplicationState;

use super::{EntityId, RepositoryEntity, WithAssignedId};

// region: --- academic centre

#[skip_serializing_none]
#[derive(Serialize, Debug, PartialEq, Eq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AcademicCentre {
    pub id: EntityId,
    pub name: String,
}

impl RepositoryEntity for AcademicCentre {
    fn id(&self) -> EntityId {
        self.id.clone()
    }
}

// endregion: --- academic centre

// region: --- academic centre for create

#[skip_serializing_none]
#[derive(Deserialize, Debug, PartialEq, Eq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AcademicCentreForCreate {
    pub name: String,
}

impl WithAssignedId<AcademicCentre> for AcademicCentreForCreate {
    fn with_assigned_id(self, id: &EntityId) -> AcademicCentre {
        AcademicCentre {
            id: id.clone(),
            name: self.name,
        }
    }
}

// endregion: --- academic centre for create

// region: --- academic centre for update

#[skip_serializing_none]
#[derive(Deserialize, Debug, PartialEq, Eq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AcademicCentreForUpdate {
    pub name: Option<String>,
}

// endregion: --- academic centre for update

// region: --- academic centre service

impl ApplicationState {
    pub fn create_academic_centre<V: WithAssignedId<AcademicCentre>>(
        &mut self,
        values: V,
    ) -> AcademicCentre {
        let mut academic_centres = self.get_academic_centres();
        let result = academic_centres.create(values);
        self.modified_state();
        result.clone()
    }

    pub fn get_academic_centre_by_name(&self, name: String) -> Option<AcademicCentre> {
        let academic_centres = self.get_academic_centres();
        let result = academic_centres.any_match(&|ac| ac.name == name)?;
        Some(result.clone())
    }

    pub fn get_all_academic_centres(&self) -> Vec<AcademicCentre> {
        self.get_academic_centres()
            .get_all()
            .iter()
            .map(|academic_centre| AcademicCentre::clone(&academic_centre))
            .collect()
    }

    pub fn bulk_create_academic_centres(
        &mut self,
        academic_centres: impl Iterator<Item = AcademicCentreForCreate>,
    ) -> Box<dyn FnOnce(&ApplicationState) -> ()> {
        let mut created = Vec::new();
        let start_id = self.get_academic_centres().current_id.clone();

        academic_centres
            .for_each(|values| created.push(self.get_academic_centres().create(values).id.clone()));
        self.modified_state();

        Box::new(move |state: &ApplicationState| {
            state.get_academic_centres().current_id = start_id;
            created.iter().for_each(|id| {
                state.get_academic_centres().delete(id.clone());
            });
            state.modified_state();
        })
    }
}

// endregion: --- academic centre service

use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;

use crate::ctx::ApplicationState;

use super::{EntityId, RepositoryEntity, WithAssignedId};

// region: --- academic centre

#[skip_serializing_none]
#[derive(Serialize, Debug, PartialEq, Eq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AcademicCentre {
    id: EntityId,
    name: String,
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
    name: String,
}

impl WithAssignedId<AcademicCentre> for AcademicCentreForCreate {
    fn with_assigned_id(&self, id: &EntityId) -> AcademicCentre {
        AcademicCentre {
            id: id.clone(),
            name: self.name.clone(),
        }
    }
}

// endregion: --- academic centre for create

// region: --- academic centre for update

#[skip_serializing_none]
#[derive(Deserialize, Debug, PartialEq, Eq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AcademicCentreForUpdate {
    name: Option<String>,
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

    pub fn get_all_academic_centres(&self) -> Vec<AcademicCentre> {
        self.get_academic_centres()
            .get_all()
            .iter()
            .map(|academic_centre| AcademicCentre::clone(&academic_centre))
            .collect()
    }

    pub fn get_or_create_academic_centre(&mut self, name: String) -> AcademicCentre {
        let mut academic_centres = self.get_academic_centres();
        let all = academic_centres.get_all();
        let centre = all.iter().find(|ac| ac.name == name);
        match centre {
            Some(centre) => AcademicCentre::clone(centre),
            None => {
                let result = academic_centres.create(AcademicCentreForCreate { name });
                self.modified_state();
                result.clone()
            }
        }
    }
}

// endregion: --- academic centre service

use serde::{Deserialize, Serialize};
use std::collections::hash_map::HashMap;

pub mod academic_centre;
pub mod examinee;
pub mod subject;

#[derive(Debug, Serialize, Deserialize, PartialEq, Eq, Clone, Hash)]
pub struct EntityId(i32);

pub trait WithAssignedId<T>
where
    T: RepositoryEntity,
{
    fn with_assigned_id(self, id: &EntityId) -> T;
}

pub trait RepositoryEntityUpdater<T>
where
    T: RepositoryEntity,
{
    fn update_values(self, entity: &mut T);
}

pub trait RepositoryEntity
where
    Self: Clone,
{
    fn id(&self) -> EntityId;
}

pub struct Repository<T>
where
    T: RepositoryEntity,
{
    current_id: EntityId,
    entities: HashMap<EntityId, T>,
}

impl<T> Repository<T>
where
    T: RepositoryEntity,
{
    pub fn new() -> Self {
        Repository {
            current_id: EntityId(0),
            entities: HashMap::new(),
        }
    }

    fn next_id(&mut self) -> EntityId {
        let next_id = self.current_id.0 + 1;
        self.current_id = EntityId(next_id);
        EntityId(next_id)
    }
}

impl<T> Repository<T>
where
    T: RepositoryEntity,
{
    pub fn create<V: WithAssignedId<T>>(&mut self, values: V) -> &T {
        let next_id = self.next_id();
        let new = values.with_assigned_id(&next_id);
        self.entities.insert(next_id.clone(), new.clone());
        &self.entities[&next_id]
    }

    pub fn get(&self, id: EntityId) -> Option<&T> {
        self.entities.get(&id)
    }

    pub fn get_all(&self) -> Vec<&T> {
        self.entities.values().collect()
    }

    pub fn update<V: RepositoryEntityUpdater<T>>(&mut self, id: EntityId, values: V) -> Option<&T> {
        let entity = self.entities.get_mut(&id)?;
        values.update_values(entity);
        Some(&self.entities[&id])
    }

    pub fn delete(&mut self, id: EntityId) -> bool {
        self.entities.remove(&id).is_some()
    }

    pub fn any_match(&self, matcher: &impl Fn(&&T) -> bool) -> Option<&T> {
        self.entities.values().find(matcher)
    }
}

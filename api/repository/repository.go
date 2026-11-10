package repository

import (
	"gerenciador-de-projetos-back/model"
	"uuid"

	"gorm.io/gorm"
)

type Repository[T any] interface {
	Create(entity *T) error
	FindAll(filters []model.QueryFilter) ([]T, error)
	FindByID(id uuid.UUID) (*T, error)
	Update(entity *T) error
	Delete(id uuid.UUID) error
}

type gormRepository[T any] struct {
	db *gorm.DB
}

func NewRepository[T any](db *gorm.DB) Repository[T] {
	return &gormRepository[T]{db: db}
}

func (r *gormRepository[T]) Create(entity *T) error {
	return r.db.Create(entity).Error
}

func (r *gormRepository[T]) FindAll(filters []model.QueryFilter) ([]T, error) {
	var entities []T
	query := r.db.Model(new(T))

	for _, filter := range filters {
		switch filter.Operator {
		case model.EqualOperator:
			query = query.Where(filter.Column+" = ?", filter.Value)
		case model.NotEqualOperator:
			query = query.Where(filter.Column+" != ?", filter.Value)
		case model.LikeOperator:
			query = query.Where(filter.Column+" LIKE ?", "%"+filter.Value.(string)+"%")
		}
	}

	err := query.Find(&entities).Error
	return entities, err
}

func (r *gormRepository[T]) FindByID(id uuid.UUID) (*T, error) {
	var entity T
	if err := r.db.First(&entity, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &entity, nil
}

func (r *gormRepository[T]) Update(entity *T) error {
	return r.db.Save(entity).Error
}

func (r *gormRepository[T]) Delete(id uuid.UUID) error {
	var entity T
	return r.db.Delete(&entity, "id = ?", id).Error
}

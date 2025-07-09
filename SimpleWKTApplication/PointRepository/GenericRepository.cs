using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using SimpleWKTApplication;

namespace SimpleWKTApplication.Data
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        protected readonly AppDbContext _context;

        public GenericRepository(AppDbContext context)
        {
            _context = context;
        }

        public T Add(T entity)
        {
            _context.Set<T>().Add(entity);
            _context.SaveChanges();
            return entity;
        }

        public IEnumerable<T> AddRange(IEnumerable<T> entities)
        {
            _context.Set<T>().AddRange(entities);
            _context.SaveChanges();
            return entities;
        }

        public T Update(T entity)
        {
            var idProperty = entity.GetType().GetProperty("Id");
            if (idProperty == null)
            {
                throw new ArgumentException("Spatial idsi yok");
            }

            var idValue = (int)idProperty.GetValue(entity);
            var existingEntity = _context.Set<T>().Find(idValue);

            if (existingEntity == null)
            {
                throw new NotFoundException("Spatial bulunamadý");
            }

            _context.Entry(existingEntity).CurrentValues.SetValues(entity);
            _context.SaveChanges();
            return existingEntity;
        }

        public T Delete(int id)
        {
            var entity = _context.Set<T>().Find(id);
            if (entity == null)
            {
                throw new NotFoundException("Spatial bulunamadý");
            }

            _context.Set<T>().Remove(entity);
            _context.SaveChanges();
            return entity;
        }

        public T GetById(int id)
        {
            var entity = _context.Set<T>().Find(id);
            if (entity == null)
            {
                throw new NotFoundException("Spatial bulunamadý");
            }
            return entity;
        }

        public IEnumerable<T> GetAll()
        {
            return _context.Set<T>().ToList();
        }

        public IEnumerable<T> Find(Expression<Func<T, bool>> predicate)
        {
            return _context.Set<T>().Where(predicate).ToList();
        }

        public IEnumerable<T> GetBetweenIds(int startId, int endId)
        {
            var parameter = Expression.Parameter(typeof(T), "x");
            var property = Expression.Property(parameter, "Id");
            var startConstant = Expression.Constant(startId);
            var endConstant = Expression.Constant(endId);
            var greaterThanOrEqual = Expression.GreaterThanOrEqual(property, startConstant);
            var lessThanOrEqual = Expression.LessThanOrEqual(property, endConstant);
            var and = Expression.AndAlso(greaterThanOrEqual, lessThanOrEqual);
            var lambda = Expression.Lambda<Func<T, bool>>(and, parameter);

            return _context.Set<T>().Where(lambda).ToList();
        }
    }
}
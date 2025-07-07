using Microsoft.EntityFrameworkCore;
using SimpleWKTApplication.Response;
using System.Linq.Expressions;

namespace SimpleWKTApplication.Data
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        protected readonly AppDbContext _context;

        public GenericRepository(AppDbContext context)
        {
            _context = context;
        }

        public Result Add(T entity)
        {
            _context.Set<T>().Add(entity);
            return new Result { Success = true, Message = "Entity added", Data = entity };
        }

        public Result AddRange(IEnumerable<T> entities)
        {
            _context.Set<T>().AddRange(entities);
            return new Result { Success = true, Message = "Entities added", Data = entities };
        }

        public Result Update(T entity)
        {
            var idProperty = entity.GetType().GetProperty("Id");
            if (idProperty == null)
            {
                return new Result { Success = false, Message = "Entity does not have an Id property" };
            }

            var idValue = (int)idProperty.GetValue(entity);
            var existingEntity = _context.Set<T>().Find(idValue);
            
            if (existingEntity == null)
            {
                return new Result { Success = false, Message = "Entity not found" };
            }

            _context.Entry(existingEntity).CurrentValues.SetValues(entity);
            return new Result { Success = true, Message = "Entity updated", Data = existingEntity };
        }

        public Result Delete(int id)
        {
            var entity = _context.Set<T>().Find(id);
            if (entity == null)
            {
                return new Result { Success = false, Message = "Entity not found" };
            }

            _context.Set<T>().Remove(entity);
            return new Result { Success = true, Message = "Entity deleted", Data = entity };
        }

        public T GetById(int id)
        {
            return _context.Set<T>().Find(id);
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
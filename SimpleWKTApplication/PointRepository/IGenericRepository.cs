using System.Linq.Expressions;

namespace SimpleWKTApplication.Data
{
    public interface IGenericRepository<T> where T : class
    {
        T Add(T entity);
        IEnumerable<T> AddRange(IEnumerable<T> entities);
        T Update(T entity);
        T Delete(int id);
        T GetById(int id);
        IEnumerable<T> GetAll();
        IEnumerable<T> Find(Expression<Func<T, bool>> predicate);
        IEnumerable<T> GetBetweenIds(int startId, int endId);
    }
}
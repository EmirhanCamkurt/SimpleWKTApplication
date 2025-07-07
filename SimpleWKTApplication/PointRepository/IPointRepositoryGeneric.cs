using SimpleWKTApplication.Response;
using System.Linq.Expressions;

namespace SimpleWKTApplication.Data
{
    public interface IGenericRepository<T> where T : class
    {
        Result Add(T entity);
        Result AddRange(IEnumerable<T> entities);
        Result Update(T entity);
        Result Delete(int id);
        T GetById(int id);
        IEnumerable<T> GetAll();
        IEnumerable<T> Find(Expression<Func<T, bool>> predicate);
        IEnumerable<T> GetBetweenIds(int startId, int endId);
    }
}
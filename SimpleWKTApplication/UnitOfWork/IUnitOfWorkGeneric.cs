using SimpleWKTApplication.Entity;
namespace SimpleWKTApplication.Data
{
    public interface IUnitOfWorkGeneric : IDisposable
    {
        IGenericRepository<Point> Points { get; }
        Task<int> CompleteAsync();
        int Complete();
    }
}
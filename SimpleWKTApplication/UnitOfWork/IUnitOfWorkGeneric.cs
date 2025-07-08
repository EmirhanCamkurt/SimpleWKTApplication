using SimpleWKTApplication.Entity;
namespace SimpleWKTApplication.Data
{
    public interface IUnitOfWorkGeneric : IDisposable
    {
        IGenericRepository<Spatial> Spatials { get; }
        Task<int> CompleteAsync();
        int Complete();
    }
}
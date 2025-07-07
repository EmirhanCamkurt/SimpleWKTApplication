namespace SimpleWKTApplication.Data
{
    public interface IUnitOfWork : IDisposable
    {
        IPointRepository Points { get; }
        Task<int> CompleteAsync();
        int Complete();
    }
}


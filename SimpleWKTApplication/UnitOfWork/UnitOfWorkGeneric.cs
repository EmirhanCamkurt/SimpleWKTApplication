using SimpleWKTApplication.Entity;

namespace SimpleWKTApplication.Data
{
    public class UnitOfWorkGeneric : IUnitOfWorkGeneric
    {
        private readonly AppDbContext _context;
        private IGenericRepository<Spatial> _spatials;

        public UnitOfWorkGeneric(AppDbContext context)
        {
            _context = context;
        }

        public IGenericRepository<Spatial> Spatials
        {
            get
            {
                if (_spatials == null)
                {
                    _spatials = new GenericRepository<Spatial>(_context);
                }
                return _spatials;
            }
        }

        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public int Complete()
        {
            return _context.SaveChanges();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
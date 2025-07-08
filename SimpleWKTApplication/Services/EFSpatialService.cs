using NetTopologySuite.IO;
using SimpleWKTApplication.Data;
using SimpleWKTApplication.Entity;
using SimpleWKTApplication.Validators;
using System.Collections.Generic;
using System.Linq;

namespace SimpleWKTApplication.Services
{
    public class EFSpatialService : ISpatialService
    {
        private readonly IUnitOfWorkGeneric _unitOfWork;
        private readonly WKTReader _wktReader;

        public EFSpatialService(IUnitOfWorkGeneric unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _wktReader = new WKTReader();
        }

        public Spatial AddSpatial(string name, string wkt)
        {
            var geometry = _wktReader.Read(wkt);
            var spatial = new Spatial { Name = name, WKT = geometry };

            Validator.Validate(spatial);
            return _unitOfWork.Spatials.Add(spatial);
        }

        public IEnumerable<Spatial> AddRange(List<Spatial> spatials)
        {
            Validator.ValidateRange(spatials);
            return _unitOfWork.Spatials.AddRange(spatials);
        }

        public Spatial DeleteSpatial(int id)
        {
            return _unitOfWork.Spatials.Delete(id);
        }

        public List<Spatial> GetAllSpatials()
        {
            return _unitOfWork.Spatials.GetAll().ToList();
        }

        public Spatial GetSpatialById(int id)
        {
            return _unitOfWork.Spatials.GetById(id);
        }

        public IEnumerable<Spatial> GetSpatialsBetweenIds(int startId, int endId)
        {
            return _unitOfWork.Spatials.GetBetweenIds(startId, endId);
        }

        public Spatial UpdateSpatial(int id, string name, string wkt)
        {
            var geometry = _wktReader.Read(wkt);
            var spatial = new Spatial { Id = id, Name = name, WKT = geometry };

            Validator.Validate(spatial);
            return _unitOfWork.Spatials.Update(spatial);
        }
    }
}
using SimpleWKTApplication.Data;
using SimpleWKTApplication.Entity;
using SimpleWKTApplication.Response;
using SimpleWKTApplication.Validators;

namespace SimpleWKTApplication.Services
{
    public class EFPointService : IPointService
    {
        private readonly IUnitOfWorkGeneric _unitOfWork;

        public EFPointService(IUnitOfWorkGeneric unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public Result AddPoint(string name, string wkt)
        {
            var point = new Point { Name = name, WKT = wkt };
            var validation = Validator.Validate(point);
            if (!validation.Success) return validation;

            var result = _unitOfWork.Points.Add(point);
            _unitOfWork.Complete();

            return result;
        }

        public Result UpdatePoint(int id, string name, string wkt)
        {
            var point = new Point { Id = id, Name = name, WKT = wkt };
            var validation = Validator.Validate(point);
            if (!validation.Success) return validation;

            var result = _unitOfWork.Points.Update(point);
            _unitOfWork.Complete();

            return result;
        }

        public Result DeletePoint(int id)
        {
            var result = _unitOfWork.Points.Delete(id);
            _unitOfWork.Complete();

            return result;
        }

        public Result GetPointById(int id)
        {
            var point = _unitOfWork.Points.GetById(id);
            return point == null
                ? new Result { Success = false, Message = "Nokta bulunamadi" }
                : new Result { Success = true, Message = "Nokta bulundu", Data = point };
        }

        public Result AddRange(List<Point> points)
        {
            var validation = Validator.ValidateRange(points);
            if (!validation.Success) return validation;

            var result = _unitOfWork.Points.AddRange(points);
            _unitOfWork.Complete();

            return new Result
            {
                Success = true,
                Message = "Butun noktalar eklendi.",
                Data = points
            };
        }

        public List<Point> GetAllPoints()
        {
            return _unitOfWork.Points.GetAll().ToList();
        }

        public Result GetPointsBetweenIds(int startId, int endId)
        {
            var points = _unitOfWork.Points.GetBetweenIds(startId, endId).ToList();

            return new Result
            {
                Success = true,
                Message = "Noktalar basariyla donduruldu!",
                Data = points
            };
        }
    }
}
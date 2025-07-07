using Microsoft.AspNetCore.Mvc;
using SimpleWKTApplication.Entity;
using SimpleWKTApplication.Response;
using SimpleWKTApplication.Services;

namespace SimpleWKTApplication.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PointController : ControllerBase
    {
        private readonly IPointService _pointService;

        public PointController(IPointService pointService)
        {
            _pointService = pointService;
        }

        [HttpPost]
        public Result Add(string name, string wkt) =>
            _pointService.AddPoint(name, wkt);
        [HttpPost("range")]
        [Consumes("application/json")]
        [Produces("application/json")]
        public Result AddRange([FromBody] List<Point> points) =>
    _pointService.AddRange(points);
        [HttpGet("{id}")]
        public Result Get(int id) => _pointService.GetPointById(id);

        [HttpGet]
        public List<Point> GetAll() => _pointService.GetAllPoints();

        [HttpPut("{id}")]
        public Result Update(int id, string name, string wkt) =>
              _pointService.UpdatePoint(id, name, wkt);
        [HttpDelete("{id}")]
        public Result Delete(int id) => _pointService.DeletePoint(id);

        [HttpGet("{startId}/{endId}")]
        public Result GetBetween(int startId, int endId) =>
            _pointService.GetPointsBetweenIds(startId, endId);
    }
}
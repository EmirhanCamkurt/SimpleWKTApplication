using Microsoft.AspNetCore.Mvc;
using SimpleWKTApplication.Entity;
using SimpleWKTApplication.Services;

namespace SimpleWKTApplication.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SpatialController : ControllerBase
    {
        private readonly ISpatialService _spatialService;

        public SpatialController(ISpatialService spatialService)
        {
            _spatialService = spatialService;
        }

        [HttpPost]
        public ActionResult<Spatial> Add(string name, string wkt)
        {
            try
            {
                return _spatialService.AddSpatial(name, wkt);
            }
            catch (ValidationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("range")]
        [Consumes("application/json")]
        [Produces("application/json")]
        public ActionResult<IEnumerable<Spatial>> AddRange([FromBody] List<Spatial> spatials)
        {
            try
            {
                return Ok(_spatialService.AddRange(spatials));
            }
            catch (ValidationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public ActionResult<Spatial> Get(int id)
        {
            try
            {
                return _spatialService.GetSpatialById(id);
            }
            catch (NotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet]
        [HttpGet]
        public List<Spatial> GetAll()
        {
            var spatials = _spatialService.GetAllSpatials();
            return spatials.Select(s => new Spatial
            {
                Id = s.Id,
                Name = s.Name,
                WKT = s.WKT 
            }).ToList();
        }

        [HttpPut("{id}")]
        public ActionResult<Spatial> Update(int id, string name, string wkt)
        {
            try
            {
                return _spatialService.UpdateSpatial(id, name, wkt);
            }
            catch (ValidationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (NotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }



        [HttpDelete("{id}")]
        public ActionResult<Spatial> Delete(int id)
        {
            try
            {
                return _spatialService.DeleteSpatial(id);
            }
            catch (NotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet("{startId}/{endId}")]
        public IEnumerable<Spatial> GetBetween(int startId, int endId) =>
            _spatialService.GetSpatialsBetweenIds(startId, endId);
    }
}
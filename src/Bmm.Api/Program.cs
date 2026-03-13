using System.Security.Claims;
using System.Text;
using Bmm.Api.Data;
using Bmm.Api.Dtos;
using Bmm.Api.Services;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

// Load environment variables from src/.env (one level up from Bmm.Api/)
Env.TraversePath().Load();

var builder = WebApplication.CreateBuilder(args);

// ── CORS ──────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .WithOrigins("http://localhost:3000", "https://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ── DATABASE ──────────────────────────────────────────────────────────────────
// Use InMemory by default; can be swapped to PostgreSQL via environment variable
var useInMemory = Environment.GetEnvironmentVariable("USE_INMEMORY_DB")?.ToLower() != "false";

if (useInMemory)
{
    var dbName = Environment.GetEnvironmentVariable("INMEMORY_DB_NAME") ?? "BmmDatabase";
    builder.Services.AddDbContext<AppDbContext>(opts => opts.UseInMemoryDatabase(dbName));
}
else
{
    var connStr =
        Environment.GetEnvironmentVariable("DATABASE_URL")
        ?? builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("DATABASE_URL is not set");
    builder.Services.AddDbContext<AppDbContext>(opts => opts.UseNpgsql(connStr));
}

// ── IDENTITY ──────────────────────────────────────────────────────────────────
builder
    .Services.AddIdentity<AppUser, IdentityRole>(options =>
    {
        options.Password.RequireDigit = false;
        options.Password.RequireLowercase = false;
        options.Password.RequireUppercase = false;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequiredLength = 6;
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// ── JWT AUTH ──────────────────────────────────────────────────────────────────
var jwtSecret =
    Environment.GetEnvironmentVariable("JWT_SECRET")
    ?? "dev-jwt-secret-change-in-production-minimum-32-chars-xxxx";

builder
    .Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "bmm-api",
            ValidAudience = "bmm-client",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        };
    });

builder.Services.AddAuthorization();

// ── SERVICES ──────────────────────────────────────────────────────────────────
builder.Services.AddScoped<JwtService>();

// ── SWAGGER / OPENAPI ─────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Bmm API", Version = "v1" });
    c.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            In = ParameterLocation.Header,
            Description = "Enter JWT token",
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            BearerFormat = "JWT",
            Scheme = "bearer",
        }
    );
    c.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer",
                    },
                },
                Array.Empty<string>()
            },
        }
    );
});

// ─────────────────────────────────────────────────────────────────────────────
var app = builder.Build();

// ── MIDDLEWARE PIPELINE ───────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Skip HTTPS redirection in Test environment (WebApplicationFactory uses plain HTTP)
if (!app.Environment.IsEnvironment("Test"))
{
    app.UseHttpsRedirection();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Ensure DB is created (InMemory)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

// ── HEALTH ────────────────────────────────────────────────────────────────────
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

// ── AUTH ENDPOINTS ────────────────────────────────────────────────────────────
app.MapPost(
    "/auth/register",
    async (RegisterRequest req, UserManager<AppUser> userManager, JwtService jwtService) =>
    {
        if (req.Password != req.ConfirmPassword)
            return Results.BadRequest(new { error = "Passwords do not match" });

        var user = new AppUser { UserName = req.Email, Email = req.Email };
        var result = await userManager.CreateAsync(user, req.Password);

        if (!result.Succeeded)
            return Results.BadRequest(new { errors = result.Errors.Select(e => e.Description) });

        var (token, expiry) = jwtService.GenerateToken(user);
        var refreshToken = jwtService.GenerateRefreshToken();
        return Results.Ok(new AuthResponse(token, refreshToken, expiry));
    }
);

app.MapPost(
    "/auth/login",
    async (
        LoginRequest req,
        UserManager<AppUser> userManager,
        SignInManager<AppUser> signInManager,
        JwtService jwtService
    ) =>
    {
        var user = await userManager.FindByEmailAsync(req.Email);
        if (user == null)
            return Results.Unauthorized();

        var result = await signInManager.CheckPasswordSignInAsync(user, req.Password, false);
        if (!result.Succeeded)
            return Results.Unauthorized();

        var (token, expiry) = jwtService.GenerateToken(user);
        var refreshToken = jwtService.GenerateRefreshToken();
        return Results.Ok(new AuthResponse(token, refreshToken, expiry));
    }
);

// ── MAP ENDPOINTS ─────────────────────────────────────────────────────────────
var maps = app.MapGroup("/maps").RequireAuthorization();

maps.MapGet(
    "/",
    async (ClaimsPrincipal principal, AppDbContext db) =>
    {
        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var userMaps = await db
            .MindMaps.Where(m => m.OwnerId == userId)
            .Select(m => new MapResponse(
                m.Id,
                m.Title,
                m.Data,
                m.CreatedAt,
                m.UpdatedAt,
                m.OwnerId
            ))
            .ToListAsync();
        return Results.Ok(userMaps);
    }
);

maps.MapPost(
    "/",
    async (CreateMapRequest req, ClaimsPrincipal principal, AppDbContext db) =>
    {
        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var map = new MindMapEntity
        {
            Title = req.Title,
            OwnerId = userId,
            Data = req.Data,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        db.MindMaps.Add(map);
        await db.SaveChangesAsync();
        return Results.Created(
            $"/maps/{map.Id}",
            new MapResponse(map.Id, map.Title, map.Data, map.CreatedAt, map.UpdatedAt, map.OwnerId)
        );
    }
);

maps.MapGet(
    "/{id:guid}",
    async (Guid id, ClaimsPrincipal principal, AppDbContext db) =>
    {
        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var map = await db.MindMaps.FindAsync(id);
        if (map == null)
            return Results.NotFound();
        if (map.OwnerId != userId)
            return Results.StatusCode(403);
        return Results.Ok(
            new MapResponse(map.Id, map.Title, map.Data, map.CreatedAt, map.UpdatedAt, map.OwnerId)
        );
    }
);

maps.MapPut(
    "/{id:guid}",
    async (Guid id, UpdateMapRequest req, ClaimsPrincipal principal, AppDbContext db) =>
    {
        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var map = await db.MindMaps.FindAsync(id);
        if (map == null)
            return Results.NotFound();
        if (map.OwnerId != userId)
            return Results.StatusCode(403);

        map.Title = req.Title;
        map.Data = req.Data;
        map.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Results.Ok(
            new MapResponse(map.Id, map.Title, map.Data, map.CreatedAt, map.UpdatedAt, map.OwnerId)
        );
    }
);

maps.MapDelete(
    "/{id:guid}",
    async (Guid id, ClaimsPrincipal principal, AppDbContext db) =>
    {
        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var map = await db.MindMaps.FindAsync(id);
        if (map == null)
            return Results.NotFound();
        if (map.OwnerId != userId)
            return Results.StatusCode(403);

        db.MindMaps.Remove(map);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
);

app.Run();

// Expose Program for WebApplicationFactory in tests
public partial class Program { }

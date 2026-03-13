namespace Bmm.Api.Dtos;

public record RegisterRequest(string Email, string Password, string ConfirmPassword);

public record LoginRequest(string Email, string Password);

public record AuthResponse(string Token, string RefreshToken, DateTime Expiry);

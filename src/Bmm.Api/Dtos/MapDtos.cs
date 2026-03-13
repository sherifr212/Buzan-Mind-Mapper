namespace Bmm.Api.Dtos;

public record CreateMapRequest(string Title, string Data);

public record UpdateMapRequest(string Title, string Data);

public record MapResponse(
    Guid Id,
    string Title,
    string Data,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    string OwnerId
);

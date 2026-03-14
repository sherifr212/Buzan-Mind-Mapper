FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Bmm.Api/Bmm.Api.csproj", "Bmm.Api/"]
RUN dotnet restore "Bmm.Api/Bmm.Api.csproj"
COPY . .
WORKDIR "/src/Bmm.Api"
RUN dotnet publish "Bmm.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "Bmm.Api.dll"]

using System.Text.Json;
using System.Text.Json.Serialization;
using TeamFinder.Core.Model.Teams;

namespace TeamFinder.API.Json;

public class TagObjectConverter : JsonConverter<Tag>
{
    public override void Write(Utf8JsonWriter writer, Tag value, JsonSerializerOptions options)
    {
        writer.WriteStartObject();
        writer.WriteNumber("id", (int)value);
        writer.WriteString("name", value.ToString());
        writer.WriteEndObject();
    }

    public override Tag Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        using var doc = JsonDocument.ParseValue(ref reader);
        return (Tag)doc.RootElement.GetProperty("id").GetInt32();
    }
}
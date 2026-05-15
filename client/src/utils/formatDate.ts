export function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    })
}
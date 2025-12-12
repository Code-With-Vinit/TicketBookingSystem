export const BASE_URL = "https://your-backend-url.com";

export async function fetchShows() {
  const res = await fetch(`${BASE_URL}/shows`);
  return res.json();
}

export async function createShow(data: any) {
  const res = await fetch(`${BASE_URL}/shows`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function bookSeats(showId: number, seats: number[]) {
  const res = await fetch(`${BASE_URL}/book/${showId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ seats }),
  });
  return res.json();
}

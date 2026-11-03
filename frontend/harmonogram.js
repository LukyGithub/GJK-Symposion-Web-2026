async function fill_harmonogram() {
  const getData = async () => {
    const time = new Date().getTime(); // Add it to the URL to prevent caching
    const harmonogramURL = "./API/harmonogram/harmonogram.json";
    const url = harmonogramURL; //+ "&t=" + time;
    let data;
    try {
      data = await cachedFetch("harmonogram", url, 180);
    } catch {
      console.error("error fetching data");
    }
    return data;
  };
  const data = await getData();
  const days = data["days"];

  days.forEach((day, index) => {
    const container = document.getElementById("harmonogram_days");
    const day_div = document.createElement("div");
    day_div.classList.add("day_table");
    const day_title = document.createElement("h3");
    day_title.textContent = day.day;
    day_div.appendChild(day_title);
    const table = document.createElement("table");
    table.id = "harmonogram_" + index;
    const header_row = document.createElement("tr");
    const time_header = document.createElement("th");
    time_header.textContent = "Čas";
    header_row.appendChild(time_header);

    const rooms = [];

    day.times.forEach((time) => {
      time.lectures.forEach((lecture) => {
        if (!rooms.includes(lecture.room)) {
          rooms.push(lecture.room);
        }
      });
    });

    function room_sort(a, b) {
      if (a[0] == "P" && b[0] != "P") return 1;
      else if (a[0] != "P" && b[0] == "P") return -1;
      return a.localeCompare(b, "cs");
    }

    rooms.sort(room_sort);

    rooms.forEach((room) => {
      const room_header = document.createElement("th");
      room_header.textContent = room;
      header_row.appendChild(room_header);
    });
    table.appendChild(header_row);

    day.times.forEach((time) => {
      if (time.time == "13:00" || time.time == "14:00") {
        const row = document.createElement("tr");
        const time_cell = document.createElement("td");
        time_cell.textContent = day.day == "Pondělí" ? "12:00" : "13:00";
        row.appendChild(time_cell);
        const lunch_cell = document.createElement("td");
        lunch_cell.setAttribute("colspan", rooms.length);
        lunch_cell.classList.add("presenter", "lunch");
        lunch_cell.textContent = "Oběd";
        row.classList.add("lunch_row");
        row.appendChild(lunch_cell);
        table.appendChild(row);
      }

      const row = document.createElement("tr");
      const time_cell = document.createElement("td");
      time_cell.textContent = time.time;
      row.appendChild(time_cell);

      const lectures = time.lectures;
      lectures.sort((a, b) => room_sort(a.room, b.room));

      lectures.forEach((lecture) => {
        const cell = document.createElement("td");
        if (lecture.name != "" && lecture.title != "") {
          cell.setAttribute("onclick", "popup(" + lecture.id + ")");
          cell.classList.add("clickable");
        }
        if (lecture.name == "" && lecture.title == "") {
          cell.classList.add("empty");
        }
        const presenter_p = document.createElement("p");
        presenter_p.classList.add("presenter");
        presenter_p.textContent = lecture.name;
        const lecture_p = document.createElement("p");
        lecture_p.classList.add("lecture");
        lecture_p.textContent = lecture.title;
        cell.appendChild(presenter_p);
        cell.appendChild(lecture_p);
        row.appendChild(cell);
      });

      table.appendChild(row);
    });

    day_div.appendChild(table);
    container.appendChild(day_div);
  });
}

async function cachedFetch(name, url, refresh_time) {
  let lst = "T_" + name;
  let t = Math.floor(new Date().getTime() / 1000);
  if (lst in localStorage) {
    if (t - localStorage[lst] < refresh_time) {
      console.log(
        "fetch to " + url + " was cached " + (t - localStorage[lst]) + "s ago"
      );
      return JSON.parse(localStorage[name]);
    }
  }
  console.log("fetching " + url);
  let r = await fetch(url);

  try {
    if (r.ok) {
      const json = await r.json();
      localStorage[lst] = t;
      localStorage[name] = JSON.stringify(json);
      return json;
    } else {
      throw new Error("fetch_error");
    }
  } catch (error) {
    console.error(error.message);
    console.error("net_error: " + error);
    if (lst in localStorage) {
      console.log(
        "fallback to cache for " +
          url +
          " from " +
          (t - localStorage[lst]) +
          "s ago"
      );
      return localStorage[name];
    }
  }
}
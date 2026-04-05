import { formatTime, escapeHtml, advanceDueDate } from "../src/utils";

describe("formatTime", () => {
  it("formats zero seconds", () => {
    expect(formatTime(0)).toBe("00:00");
  });

  it("formats seconds under a minute", () => {
    expect(formatTime(45)).toBe("00:45");
  });

  it("formats exactly one minute", () => {
    expect(formatTime(60)).toBe("01:00");
  });

  it("pads minutes and seconds to two digits", () => {
    expect(formatTime(125)).toBe("02:05");
  });

  it("handles large values", () => {
    expect(formatTime(3599)).toBe("59:59");
  });
});

describe("escapeHtml", () => {
  it("escapes ampersands", () => {
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  it("escapes less-than and greater-than", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('"hello"')).toBe("&quot;hello&quot;");
  });

  it("leaves safe strings unchanged", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });

  it("escapes multiple entities in one string", () => {
    expect(escapeHtml('<a href="x&y">z</a>')).toBe(
      '&lt;a href=&quot;x&amp;y&quot;&gt;z&lt;/a&gt;'
    );
  });
});

describe("advanceDueDate", () => {
  it("advances a daily recurrence by 1 day", () => {
    expect(advanceDueDate("2026-04-04", "daily")).toBe("2026-04-05");
  });

  it("advances a weekly recurrence by 7 days", () => {
    expect(advanceDueDate("2026-04-04", "weekly")).toBe("2026-04-11");
  });

  it("rolls over month boundaries for daily", () => {
    expect(advanceDueDate("2026-01-31", "daily")).toBe("2026-02-01");
  });

  it("rolls over year boundaries for weekly", () => {
    expect(advanceDueDate("2025-12-29", "weekly")).toBe("2026-01-05");
  });
});

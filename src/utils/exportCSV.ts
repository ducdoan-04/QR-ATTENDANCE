interface AttendanceRecord {
  mssv: string;
  time: string;
  date: string;
}

export function exportCSV(data: AttendanceRecord[]): void {
  const header = "MSSV,Ngày,Thời gian\n";
  const rows = data.map(r => `${r.mssv},${r.date},${r.time}`).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `attendance_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
} 
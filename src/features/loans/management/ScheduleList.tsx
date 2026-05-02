// Removed unused React
import Card from "../../../components/ui/card/Card";
import { formatCurrency } from "../../../lib/formatters";
import type { DashboardScheduleWithLoan } from "../../../repositories/ScheduleRepository";
import LoadingState from "../../../components/ui/LoadingState";

interface ScheduleListProps {
  schedules: DashboardScheduleWithLoan[];
  onScheduleClick: (schedule: DashboardScheduleWithLoan) => void;
  loading: boolean;
}

export default function ScheduleList({
  schedules,
  onScheduleClick,
  loading,
}: ScheduleListProps) {
  if (loading) {
    return <LoadingState message="Loading collection schedules..." />;
  }

  if (schedules.length === 0) {
    return (
      <Card
        padding="lg"
        variant="subtle"
        className="border-dashed border-2 bg-transparent text-center opacity-70 py-16"
      >
        No payments scheduled for this period.
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {schedules.map((schedule) => (
        <Card
          key={schedule.id}
          interactive
          padding="md"
          onClick={() => {
            // Only allow interaction on unpaid/partial/missed
            if (schedule.status !== "paid") {
              onScheduleClick(schedule);
            }
          }}
          className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:shadow-lg ${schedule.status === "paid" ? "opacity-60 cursor-default shadow-none bg-gray-50/50" : "bg-white"}`}
        >
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-black tracking-widest uppercase mb-1">
              Due: {schedule.due_date ? new Date(schedule.due_date).toLocaleDateString() : "N/A"}
            </span>
            <span className="font-bold text-lg text-main-blue truncate max-w-[200px] sm:max-w-[300px]">
              {schedule.loan?.borrower?.full_name || "Unknown Borrower"}
            </span>
            <span className="text-xs text-gray-500 mt-0.5">
              Loan: {schedule.loan_id?.substring(0, 8)}...
            </span>
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0">
            <span className="text-2xl font-black text-main-blue">
              {formatCurrency(schedule.amount_due)}
            </span>

            <span
              className={`text-[10px] font-black uppercase px-3 py-1 rounded-full mt-1 tracking-tighter shadow-sm ${
                schedule.status === "paid"
                  ? "bg-green-100 text-green-700"
                  : schedule.status === "missed"
                    ? "bg-red-100 text-red-700"
                    : schedule.status === "partial"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-blue-100 text-main-blue outline outline-1 outline-blue-200"
              }`}
            >
              {schedule.status}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}

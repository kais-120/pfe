import { useState } from "react";
import { DatePicker, parseDate, Portal } from "@chakra-ui/react";
import { LuCalendar } from "react-icons/lu";

const Test = () => {
  const [date, setDate] = useState(null);

  // 🔹 الشهر المختار (مثلا Août 2026)
  const year = 2026;
  const month = 7; // 👈 August (0-based: 0=Jan)

  const minDate = new Date(year, month, 1);
  const maxDate = new Date(year, month + 1, 0); // آخر نهار في الشهر

  return (
    <DatePicker.Root
      value={date}
      min={parseDate(minDate)}
      max={parseDate(maxDate)}
      onValueChange={(e) => setDate(e.valueAsDate)}
      maxWidth="20rem"
      minView="day"
    >
      <DatePicker.Label>Select Day</DatePicker.Label>

      <DatePicker.Control>
        <DatePicker.Input
          value={date ? date.getDate() : ""}
          readOnly
        />

        <DatePicker.IndicatorGroup>
          <DatePicker.Trigger>
            <LuCalendar />
          </DatePicker.Trigger>
        </DatePicker.IndicatorGroup>
      </DatePicker.Control>

      <Portal>
        <DatePicker.Positioner>
          <DatePicker.Content>
            {/* 👇 خلي كان view day */}
            <DatePicker.View view="day">
              <DatePicker.Header />
              <DatePicker.DayTable />
            </DatePicker.View>
          </DatePicker.Content>
        </DatePicker.Positioner>
      </Portal>
    </DatePicker.Root>
  );
};

export default Test;
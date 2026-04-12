import React, { useEffect, useRef, useState } from "react";
import { Box, Flex, Text, Button, Grid } from "@chakra-ui/react";

const DAYS = ["Lu", "Ma", "Me", "Ju", "Ve", "Sa", "Di"];
const MONTHS = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  let day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function isSameDay(a, b) {
  return a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isBetween(date, start, end) {
  if (!start || !end) return false;
  const t = date.getTime();
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return t > Math.min(s, e) && t < Math.max(s, e);
}

function isBeforeToday(date) {
  const today = new Date();
  today.setHours(0,0,0,0);
  return date < today;
}

function formatDate(date) {
  if (!date) return "";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

// --- MonthGrid component ---
function MonthGrid({ year, month, startDate, endDate, hoverDate, onDayClick, onDayHover }) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells = [];

  for (let i=0; i<firstDay; i++) cells.push(null);
  for (let d=1; d<=daysInMonth; d++) cells.push(new Date(year, month, d));

  const rangeEnd = hoverDate && !endDate ? hoverDate : endDate;

  return (
    <Box p={2} w="full">
      <Grid templateColumns="repeat(7,1fr)" mb={2}>
        {DAYS.map(d => <Text key={d} textAlign="center" fontSize="xs" fontWeight="semibold" color="gray.400">{d}</Text>)}
      </Grid>

      <Grid templateColumns="repeat(7,1fr)">
        {cells.map((date, idx) => {
          if (!date) return <Box key={`empty-${idx}`} h="36px" />;

          const isStart = isSameDay(date, startDate);
          const isEnd = isSameDay(date, endDate) || (hoverDate && !endDate && isSameDay(date, hoverDate));
          const inRange = isBetween(date, startDate, rangeEnd);
          const disabled = isBeforeToday(date);

          return (
            <Box
              key={`${year}-${month}-${date.getDate()}`}
              h="36px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="relative"
              _before={inRange || isStart || isEnd ? {
                content: '""',
                position: "absolute",
                top: "4px",
                bottom: "4px",
                left: isStart ? "50%" : "0",
                right: isEnd ? "50%" : "0",
                bg: "blue.100",
                zIndex: 0
              } : {}}
            >
              <Box
                as="button"
                position="relative"
                zIndex={1}
                w="32px"
                h="32px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="sm"
                fontWeight={isStart || isEnd ? "bold" : "medium"}
                border={"none"}
                userSelect="none"
                disabled={disabled}
                onClick={() => !disabled && onDayClick(date)}
                onMouseEnter={() => !disabled && onDayHover(date)}
                cursor={disabled ? "not-allowed" : "pointer"}
                color={isStart || isEnd ? "white" : inRange ? "blue.800" : disabled ? "gray.300" : "gray.700"}
                bg={isStart || isEnd ? "blue.600" : "transparent"}
              >
                <Text fontSize="sm">{date.getDate()}</Text>
              </Box>
            </Box>
          )
        })}
      </Grid>
    </Box>
  )
}

export default function DatePicker({ checkIn, checkOut,setCheckIn,setCheckOut,isBorder }) {
  const today = new Date();
  const threeNight = new Date(today)
  threeNight.setDate(threeNight.getDate() + 3)
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [startDate, setStartDate] = useState(checkIn ? new Date(checkIn) : today);
  const [endDate, setEndDate] = useState(checkOut ? new Date(checkOut) : threeNight);
  const [hoverDate, setHoverDate] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useRef(null)

  const month2 = viewMonth === 11 ? 0 : viewMonth + 1;
  const year2 = viewMonth === 11 ? viewYear + 1 : viewYear;
  useEffect(() => {
  if (checkIn) {
    const d = new Date(checkIn)
    setViewMonth(d.getMonth())
    setViewYear(d.getFullYear())
  }
}, [checkIn])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); } 
    else setViewMonth(m => m-1);
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); } 
    else setViewMonth(m => m+1);
  }

  const handleDayClick = (date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
      setHoverDate(null);
      setCheckIn(date); // notify parent
    } else {
      let start = startDate;
      let end = date;
      if (date < startDate) { start = date; end = startDate; }
      setStartDate(start);
      setEndDate(end);
      setCheckIn(start);
      setCheckOut(end);
      setHoverDate(null);
    }
  }

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    setHoverDate(null);
  }

  const hasRange = startDate && endDate;
  const nightCount = hasRange ? Math.round((endDate - startDate)/86400000) : null;
  useEffect(() => {
  function handleClickOutside(e) {
    if (ref.current && !ref.current.contains(e.target)) {
      setOpen(false)
    }
  }

  document.addEventListener("mousedown", handleClickOutside)

  return () => {
    document.removeEventListener("mousedown", handleClickOutside)
  }
}, [])

  return (
    <Box ref={ref} position="relative" display="inline-block" minW="300px" w="full" maxW="400px">
      <Box
        as="button"
        onClick={() => setOpen(o => !o)}
        w="full"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={4} py={2}
        cursor={"pointer"}
        borderRadius="lg"
        h={isBorder ? "42px" : "none"}
        transition="all 0.15s"
        fontWeight={isBorder ? "500" : "600"}
        border={isBorder ? "1px solid" : "none"}
        borderColor={open ? "blue.500" : "gray.200"}
        bg={isBorder ? "gray.50" : "transparent"}
        _hover={{ borderColor: "blue.300" }}
        fontSize="sm"
      >
<Text>
  {hasRange
    ? `${formatDate(startDate)} → ${formatDate(endDate)}`
    : startDate
      ? `${formatDate(startDate)} → Choisir la date de départ`
      : "Choisir une période"}
</Text>      </Box>

      {open && (
        <Box
          position="absolute"
          top="calc(100% + 8px)"
          left={0}                 
          zIndex={1500}
          bg="white"
          borderRadius="2xl"
          boxShadow="0 20px 60px rgba(0,0,0,0.12)"
          border="1px solid"
          borderColor="gray.100"
          p={5}
          w="620px"
        >
          <Flex align="center" justify="space-between" mb={5}>
            <Button onClick={prevMonth}>Précédent</Button>
            <Text>{MONTHS[viewMonth]} {viewYear} - {MONTHS[month2]} {year2}</Text>
            <Button onClick={nextMonth}>Suivante</Button>
          </Flex>

          <Flex gap={6}>
            <MonthGrid year={viewYear} month={viewMonth} startDate={startDate} endDate={endDate} hoverDate={hoverDate} onDayClick={handleDayClick} onDayHover={setHoverDate} />
            <MonthGrid year={year2} month={month2} startDate={startDate} endDate={endDate} hoverDate={hoverDate} onDayClick={handleDayClick} onDayHover={setHoverDate} />
          </Flex>

          <Flex justify="space-between" mt={5}>
            <Text>{hasRange ? `${nightCount} nuit(s)` : startDate ? "Select check-out" : "Select check-in"}</Text>
            <Flex gap={2}>
              <Button size="sm" variant="ghost" onClick={handleClear}>Claire</Button>
              <Button size="sm" colorScheme="purple" onClick={() => setOpen(false)} disabled={!hasRange}>Appliquer</Button>
            </Flex>
          </Flex>
        </Box>
      )}
    </Box>
  )
}
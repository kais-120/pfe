import { useState } from "react"
import { Box, Flex, Text, Button, Grid } from "@chakra-ui/react"

const DAYS = ["Lu", "Ma", "Me", "Ju", "Ve", "Sa", "Di"]
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin","Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
]

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  let day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function isSameDay(a, b) {
  return a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function isBetween(date, start, end) {
  if (!start || !end) return false
  const t = date.getTime()
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
  return t > Math.min(s, e) && t < Math.max(s, e)
}

function isBeforeToday(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

function formatDate(date) {
  if (!date) return ""
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function MonthGrid({ year, month, startDate, endDate, hoverDate, onDayClick, onDayHover }) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const cells = []

  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  const rangeEnd = hoverDate && !endDate ? hoverDate : endDate

  return (
    <Box p={2} w="full">
      {/* Day headers */}
      <Grid templateColumns="repeat(7, 1fr)" mb={2}>
        {DAYS.map(d => (
          <Text
            key={d}
            textAlign="center"
            fontSize="xs"
            fontWeight="semibold"
            color="gray.400"
            py={1}
            letterSpacing="widest"
            textTransform="uppercase"
          >
            {d}
          </Text>
        ))}
      </Grid>

      {/* Day cells */}
      <Grid templateColumns="repeat(7, 1fr)">
        {cells.map((date, idx) => {
          if (!date) return <Box key={`empty-${idx}`} h="36px" />

          const isStart = isSameDay(date, startDate)
          const isEnd = isSameDay(date, endDate) ||
            (hoverDate && !endDate && isSameDay(date, hoverDate))
          const inRange = isBetween(date, startDate, rangeEnd)
          const disabled = isBeforeToday(date)
          const isToday = isSameDay(date, new Date())
          const isRangeStart = isStart && rangeEnd && !isSameDay(startDate, rangeEnd)
          const isRangeEnd = isEnd && startDate && !isSameDay(startDate, rangeEnd)

          return (
            <Box
              key={`${year}-${month}-${date.getDate()}`}
              h="36px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="relative"
              // ✅ Range band using pseudo-element via inline style trick
              _before={inRange || isRangeStart || isRangeEnd ? {
                content: '""',
                position: "absolute",
                top: "4px",
                bottom: "4px",
                left: isRangeStart ? "50%" : "0",
                right: isRangeEnd ? "50%" : "0",
                bg: "purple.100",
                zIndex: 0,
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
                borderRadius="md"
                transition="all 0.15s"
                userSelect="none"
                disabled={disabled}
                onClick={() => !disabled && onDayClick(date)}
                onMouseEnter={() => !disabled && onDayHover(date)}
                cursor={disabled ? "not-allowed" : "pointer"}
                color={
                  isStart || isEnd
                    ? "white"
                    : inRange
                      ? "purple.800"
                      : disabled
                        ? "gray.300"
                        : "gray.700"
                }
                bg={
                  isStart || isEnd
                    ? "purple.600"
                    : "transparent"
                }
                boxShadow={isStart || isEnd ? "0 4px 12px rgba(128,90,213,0.35)" : undefined}
                outline={isToday && !isStart && !isEnd ? "2px solid" : undefined}
                outlineColor={isToday && !isStart && !isEnd ? "purple.300" : undefined}
                outlineOffset={isToday && !isStart && !isEnd ? "1px" : undefined}
                _hover={
                  !disabled && !isStart && !isEnd
                    ? { bg: inRange ? "purple.200" : "purple.50" }
                    : {}
                }
                border="none"
                background={
                  isStart || isEnd
                    ? "purple.600"
                    : "transparent"
                }
              >
                <Text fontSize="sm" lineHeight={1}>{date.getDate()}</Text>
              </Box>
            </Box>
          )
        })}
      </Grid>
    </Box>
  )
}

export default function DatePicker() {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [hoverDate, setHoverDate] = useState(null)
  const [open, setOpen] = useState(false)

  const month2 = viewMonth === 11 ? 0 : viewMonth + 1
  const year2 = viewMonth === 11 ? viewYear + 1 : viewYear

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  function handleDayClick(date) {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date)
      setEndDate(null)
      setHoverDate(null)
    } else {
      if (date < startDate) {
        setEndDate(startDate)
        setStartDate(date)
      } else {
        setEndDate(date)
      }
      setHoverDate(null)
    }
  }

  function handleClear() {
    setStartDate(null)
    setEndDate(null)
    setHoverDate(null)
  }

  const hasRange = startDate && endDate
  const nightCount = hasRange ? Math.round((endDate - startDate) / 86400000) : null

  return (
    // ✅ Wrapper with enough width so dropdown doesn't go off-screen
    <Box position="relative" display="inline-block" minW="300px" w="full" maxW="400px">

      {/* Trigger Button */}
      <Box
        as="button"
        onClick={() => setOpen(o => !o)}
        w="full"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={4}
        py={2}
        borderRadius="sm"
        border="1px solid"
        borderColor={open ? "purple.500" : "gray.200"}
        bg="white"
        boxShadow={open ? "0 0 0 3px rgba(128,90,213,0.15)" : "sm"}
        color={open ? "purple.700" : "gray.600"}
        fontSize="sm"
        fontWeight="medium"
        transition="all 0.2s"
        _hover={{ borderColor: "gray.300" }}
        cursor="pointer"
      >
        <Flex align="center" gap={2}>
          <Box as="svg" w="16px" h="16px" color="black.400" fill="none" stroke="currentColor" viewBox="0 0 24 24" flexShrink={0}>
            <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="1.8"/>
            <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="1.8" strokeLinecap="round"/>
          </Box>
          {hasRange ? (
            <Text fontSize="sm" noOfLines={1}>{formatDate(startDate)} → {formatDate(endDate)}</Text>
          ) : startDate ? (
            <Text fontSize="sm">{formatDate(startDate)} → <Box as="span" color="gray.400">Pick end</Box></Text>
          ) : (
            <Text fontSize="sm" color="gray.400">Select date range</Text>
          )}
        </Flex>
        <Box
          as="svg" w="16px" h="16px" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          flexShrink={0}
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
        >
          <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Box>
      </Box>

      {/* ✅ Dropdown anchored to left:0, no centering transform */}
      {open && (
        <Box
          position="absolute"
          top="calc(100% + 8px)"
          left={0}                  // ✅ anchored to trigger's left edge
          zIndex={1500}
          bg="white"
          borderRadius="2xl"
          boxShadow="0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)"
          border="1px solid"
          borderColor="gray.100"
          p={5}
          w="620px"
          onMouseLeave={() => setHoverDate(null)}
        >
          {/* Month Navigation */}
          <Flex align="center" justify="space-between" mb={5}>
            <Box
              as="button"
              onClick={prevMonth}
              w="32px" h="32px"
              display="flex" alignItems="center" justifyContent="center"
              borderRadius="lg"
              color="gray.500"
              cursor="pointer"
              border="none"
              bg="transparent"
              _hover={{ bg: "gray.100" }}
              transition="all 0.15s"
            >
              <Box as="svg" w="16px" h="16px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </Box>
            </Box>

            <Flex gap={12} flex={1} justify="center">
              <Text fontSize="sm" fontWeight="semibold" color="gray.800" minW="140px" textAlign="center">
                {MONTHS[viewMonth]} {viewYear}
              </Text>
              <Text fontSize="sm" fontWeight="semibold" color="gray.800" minW="140px" textAlign="center">
                {MONTHS[month2]} {year2}
              </Text>
            </Flex>

            <Box
              as="button"
              onClick={nextMonth}
              w="32px" h="32px"
              display="flex" alignItems="center" justifyContent="center"
              borderRadius="lg"
              color="gray.500"
              cursor="pointer"
              border="none"
              bg="transparent"
              _hover={{ bg: "gray.100" }}
              transition="all 0.15s"
            >
              <Box as="svg" w="16px" h="16px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </Box>
            </Box>
          </Flex>

          {/* Two Months Side by Side */}
          <Flex gap={6}>
            <Box flex={1} minW={0}>
              <MonthGrid
                year={viewYear} month={viewMonth}
                startDate={startDate} endDate={endDate} hoverDate={hoverDate}
                onDayClick={handleDayClick} onDayHover={setHoverDate}
              />
            </Box>
            <Box w="1px" bg="gray.100" flexShrink={0} />
            <Box flex={1} minW={0}>
              <MonthGrid
                year={year2} month={month2}
                startDate={startDate} endDate={endDate} hoverDate={hoverDate}
                onDayClick={handleDayClick} onDayHover={setHoverDate}
              />
            </Box>
          </Flex>

          {/* Footer */}
          <Flex
            align="center"
            justify="space-between"
            mt={5} pt={4}
            borderTop="1px solid"
            borderColor="gray.100"
          >
            <Text fontSize="xs" color="gray.400" fontWeight="medium">
              {hasRange
                ? `${nightCount} night${nightCount !== 1 ? "s" : ""}`
                : startDate ? "Select check-out date" : "Select check-in date"
              }
            </Text>
            <Flex gap={2}>
              <Button size="xs" variant="ghost" colorScheme="gray" onClick={handleClear}>
                Clear
              </Button>
              <Button
                size="xs"
                colorScheme="purple"
                isDisabled={!hasRange}
                onClick={() => setOpen(false)}
              >
                Apply
              </Button>
            </Flex>
          </Flex>
        </Box>
      )}
    </Box>
  )
}
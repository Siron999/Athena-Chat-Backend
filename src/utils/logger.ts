import {
  createLogger,
  format,
  transport,
  transports,
  addColors,
} from "winston";

let alignColorsAndTime = format.combine(
  format.colorize({
    all: true,
  }),
  format.timestamp({
    format: "YY-MM-DD HH:MM:SS",
  }),
  format.printf(
    (info) => `${info.timestamp}  [${info.level}] : ${info.message}`
  )
);

addColors({
  info: "green",
  warn: "yellow",
  error: "red",
});

const log = createLogger({
  format: alignColorsAndTime,
  transports: [new transports.Console()],
});

export default log;

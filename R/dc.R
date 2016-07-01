#' Dimensional Charting in R
#'
#' R bindings for dc.js
#'
#' @import htmlwidgets
#' @importFrom htmltools tags
#' @importFrom digest digest
#' @importFrom htmlwidgets createWidget
#'
#' @export
dc <- function(data, chartRecipe = c("yearlyBubbleChart", "gainOrLossChart", "quarterChart", "dayOfWeekChart", "fluctuationChart", "moveChart", "dataCount", "dataTable"), title = NULL,
               width = NULL, height = NULL) {
  x <- list(
    data        = data,
    datahash    = digest(data),
    chartRecipe = match.arg(chartRecipe),
    title       = title
  )
  # create widget
  createWidget(
    name = 'dc',
    x,
    width = width,
    height = height,
    package = 'dcStockR'
  )
}

#' Widget output function for use in Shiny
#'
#' @export
dcOutput <- function(outputId, width = '100%', height = '300px'){
  shinyWidgetOutput(outputId, 'dc', width, height, package = 'dcStockR')
}

#' Widget render function for use in Shiny
#'
#' @export
renderDc <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  shinyRenderWidget(expr, dcOutput, env, quoted = TRUE)
}

dc_html <- function(id, style, class, ...) {
  list(
    tags$div(
      tags$strong(class = "title"),
      tags$a("reset", class="reset", href="javascript:dc.filterAll();dc.redrawAll();", style="display: none;"),
      id = id, class = class, style = style)
  )
}

#' Dimensional Charting in R
#'
#' R bindings for dc.js
#'
#' @import htmlwidgets
#' @importFrom htmltools tags
#'
#' @export
dc <- function(data, chartRecipe = "yearlyBubbleChart", xlim = NULL, width = NULL, height = NULL) {
  x <- list(
    data = data,
    chartRecipe = chartRecipe,
    xlim = xlim
  )
  # create widget
  htmlwidgets::createWidget(
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
dcOutput <- function(outputId, width = '100%', height = '400px'){
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
      tags$div(tags$a(
        "reset", class="reset", href="javascript:dc.filterAll();dc.redrawAll();", style="display: none;"
        ), id = id, class = class, style = style),
      tags$div(class = "clearfix")
    )
  }

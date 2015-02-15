#' Dimensional Charting in R
#'
#' R bindings for dc.js
#'
#' @import htmlwidgets
#'
#' @export
dc <- function(data, dimension, group, xlim = NULL, width = NULL, height = NULL) {
  
  if(is.null(xlim)) xlim <- range(data[dimension])
  
  params <- list(
    x         = getJS_Scale(xlim)
  )

  # forward options using x
  x <- list(
    data = data,
    params = params,
    dimensionFnc = getJS_dimensionFnc(dimension),
    groupFnc     = getJS_dimensionFnc(group)
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'dc',
    x,
    width = width,
    height = height,
    package = 'dcR'
  )
}

#' Widget output function for use in Shiny
#'
#' @export
dcOutput <- function(outputId, width = '100%', height = '400px'){
  shinyWidgetOutput(outputId, 'dc', width, height, package = 'dcR')
}

#' Widget render function for use in Shiny
#'
#' @export
renderDc <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  shinyRenderWidget(expr, dcOutput, env, quoted = TRUE)
}

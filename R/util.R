# Utilities

# @export
getJS_dimensionFnc <- function(propName) {
  htmlwidgets::JS(sprintf("function(x){return x['%s'];}", propName))
}

# @export
getJS_Scale        <- function(limits) {
  htmlwidgets::JS(sprintf("d3.scale.linear().domain([%f,%f])", limits[1], limits[2]))
}
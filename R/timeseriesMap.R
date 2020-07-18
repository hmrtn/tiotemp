#' <Add Title>
#'
#' <Add Description>
#'
#' @import htmlwidgets
#'
#' @export
timeseriesMap <- function(meta, data, width = NULL, height = NULL, elementId = NULL) {

  # forward options using x
  x = list(
    data = data,
    meta = meta
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'timeseriesMap',
    x,
    width = "100%",
    height = height,
    package = 'tiotemp',
    elementId = elementId,
    sizingPolicy = htmlwidgets::sizingPolicy(
      viewer.padding = 0,
      viewer.paneHeight = height,
      browser.fill = TRUE
    )
  )

}

#' Shiny bindings for timeseriesMap
#'
#' Output and render functions for using timeseriesMap within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a timeseriesMap
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name timeseriesMap-shiny
#'
#' @export
timeseriesMapOutput <- function(outputId, width = '100%', height = '400px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'timeseriesMap', width, height, package = 'tiotemp')
}

#' @rdname timeseriesMap-shiny
#' @export
renderTimeseriesMap <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, timeseriesMapOutput, env, quoted = TRUE)
}

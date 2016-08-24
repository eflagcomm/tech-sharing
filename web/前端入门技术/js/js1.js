                           $(document).ready(function($) {
                               $(".family").mouseenter(function(event) {
                                   /* Act on the event */
                                   $(this).css("background-color", "gray");
                               });
                               $(".family").mouseleave(function(event) {
                                   /* Act on the event */
                                   $(this).css("background-color", "white");
                               });
                               $(".mitem").mouseenter(function(event) {
                                   /* Act on the event */
                                   $(this).css("background-color", "darkgray");
                                   var id = $(this).attr("id");
                                   if (id == "m1")
                                       $(".submenu").css("display", "block");
                                   else {
                                       $(".submenu").css("display", "none");
                                       $(".container").css("display", "none");
                                   }
                               });
                               $(".mitem").mouseleave(function(event) {
                                   /* Act on the event */
                                   $(this).css("background-color", "gray");
                                   //$(".submenu").css("display","none");
                               });
                               $(".mitem").mousedown(function(event) {
                                   /* Act on the event */
                                   $(this).css("background-color", "white");
                               });
                               $(".mitem").mouseup(function(event) {
                                   /* Act on the event */
                                   $(this).css("background-color", "darkgray");
                               });
                               $(".sitem").mouseenter(function(event) {
                                   /* Act on the event */
                                   $(this).css("background-color", "darkgray");
                                   var id = $(this).attr("id");
                                   if (id == "s1")
                                       changec('1');
                                   if (id == "s2")
                                       changec('2');
                                   if (id == "s3")
                                       changec('3');
                                   if (id == "s4")
                                       changec('4');
                                   if (id == "s5")
                                       changec('5');
                               });
                               $("#directiondetect").mouseenter(function(event) {
                                   /* Act on the event */
                                   $(".container").css("display", "none");
                               });
                               $(".sitem").mouseleave(function(event) {
                                   /* Act on the event */
                                   $(this).css("background-color", "#ccc");

                               });
                               $(".sitem").mousedown(function(event) {
                                   /* Act on the event */
                                   $(this).css("background-color", "white");
                               });
                               $(".sitem").mouseup(function(event) {
                                   /* Act on the event */
                                   $(this).css("background-color", "darkgray");
                               });
                               $(".container").mouseleave(function(event) {
                                   /* Act on the event */
                                   $(this).css("display", "none");
                               });
                           });

                           function changec(n) {
                               for (var i = 1; i < 6; i++) {
                                   if (i == n) {
                                       $("div#c" + i).css("z-index", "100");
                                       $("div#c" + i).show();
                                   } else {
                                       $("div#c" + i).css("z-index", "-1");
                                       $("div#c" + i).hide();
                                   }

                               }
                           }



import React from "react";

export const Introduction = ({DATA}) => (
  <div>
    <h2>Prototype of global analaysis of SARS-CoV-2 frequencies</h2>

    <h3>WARNING</h3>
    <p>The frequencies here are simply counts binned into months. They do not have any KDE (smoothing) applied.</p>
    <p>Please do not rely on the valididy of these frequencies to make conclusive scientific observations.</p>
    <p>Data is from GISAID circa 2021-02-14, with ~480,000 sequences.</p>

    <h3>HOW TO USE</h3>
    Any combination of the following traits are available for analysis:
    "S:18", "S:69", "S:152", "S:417", "S:452", "S:484", "S:501", "S:677", "S:681", "pango", "clade"

    <p/>
    However there is no nice UI for this app yet, and the haplotype data is hardcoded into the app bundle.
    <p/>
    {`To specify the group of sequence traits you wish to group by, enter them as URL queries using the "group" keyword.
    For instance, to group by S:501 and (nextstrain) clade, use the URL query "?group=S:501&group=clade" and reload the page!`}


  </div>
);
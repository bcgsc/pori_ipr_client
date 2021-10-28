import React, { useState, useEffect } from 'react';
import { Typography } from '@material-ui/core';

import Image from '@/components/Image';
import { ImageType } from '@/common';

type PlotByKeyProps = {
  accessor: string;
  plots: ImageType[];
};

const PlotByKey = ({
  accessor,
  plots,
}: PlotByKeyProps): JSX.Element => {
  const [plotFound, setPlotFound] = useState<ImageType>();

  useEffect(() => {
    if (accessor && plots?.length) {
      const found = plots.find((plot) => plot.key === accessor);
      setPlotFound(found);
    }
  }, [accessor, plots]);

  return (
    <>
      {plotFound ? (
        <Image
          image={plotFound}
          showTitle
          showCaption
        />
      ) : (
        <Typography align="center">
          Image unavailable
        </Typography>
      )}
    </>
  );
};

export default PlotByKey;

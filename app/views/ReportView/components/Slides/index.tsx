import React, { useContext, useEffect, useState } from 'react';
import {
  Typography,
  Tabs,
  Tab,
  Paper,
} from '@material-ui/core';

import api from '@/services/api';
import ReportContext from '@/components/ReportContext';
import EditContext from '@/components/EditContext';
import UploadSlide from './components/UploadSlide';
import SlideType from './types';

import './index.scss';

type SlidesProps = {
  isPrint?: boolean;
};

const Slides = ({
  isPrint = false,
}: SlidesProps): JSX.Element => {
  const { report } = useContext(ReportContext);
  const { canEdit } = useContext(EditContext);

  const [slides, setSlides] = useState<SlideType[]>([]);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        const slidesResp = await api.get(`/reports/${report.ident}/presentation/slide`, {}).request();
        setSlides(slidesResp);
      };
      getData();
    }
  }, [report]);

  const handleTabChange = (event: React.ChangeEvent<HTMLInputElement>, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <div className="slides">
      <Typography variant="h3">Additional Information</Typography>
      <Paper elevation={0} variant="outlined">
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="secondary"
          textColor="secondary"
        >
          {slides.map((slide, index) => (
            <Tab key={slide.name} value={index} label={slide.name} />
          ))}
        </Tabs>
      </Paper>
      {slides.map((slide, index) => (
        <>
          {index === tabValue && (
            <>
              <Typography variant="h5" className="slides__title">
                {slide.name}
              </Typography>
              <img
                alt={slide.name}
                src={`data:${slide.object_type};base64, ${slide.object}`}
              />
            </>
          )}
        </>
      ))}
      {canEdit && !isPrint && (
        <div>
          <Typography variant="h4">Add New Slide</Typography>
          <UploadSlide />
        </div>
      )}
    </div>
  );
};

export default Slides;

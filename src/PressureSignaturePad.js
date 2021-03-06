import React from 'react';
import PropTypes from 'prop-types';
import Pressure from 'pressure';
import SignaturePad from 'signature_pad/dist/signature_pad';

class PressureSignaturePad extends React.Component {

  constructor(props) {
    super(props);

    this.handlePressureUnsupported = this.handlePressureUnsupported.bind(this);
    this.handlePressureChanged = this.handlePressureChanged.bind(this);
    this.clear = this.clear.bind(this);
    this.resize = this.resize.bind(this);
    this.addPoint = this.addPoint.bind(this);

    // State
    this.state = {
      currentPressure: 0, // current pressure
      signatureData: [], // current signature data
      pressureConfig: { // PressureJS config
        change: this.handlePressureChanged,
        unsupported: this.handlePressureUnsupported,
      },
    };

    // Callbacks
    this.callbacks = {
      onChange: (point) => {
        if (typeof this.props.onChange === 'function') this.props.onChange(point);
      },
    };
  }

  componentDidMount() {
    this.canvas = this.refs.canvas;
    this.signaturePad = new SignaturePad(this.canvas);
    this.signaturePad._addPoint = this.addPoint; // Override Signature pad methods

    this.resize();

    // Read pressure from canvas
    Pressure.set(
      this.canvas,
      this.state.pressureConfig,
      { polyfill: false });

    window.onresize = this.resize;
  }

  handlePressureUnsupported() {
    this.handlePressureChanged(null);
  }

  handlePressureChanged(value, e) {
    this.setState({ currentPressure: value });
  }

  render() {
    return (
      <div id="pressure-signature-pad" className="pressure-signature-pad">
        <canvas
          style={{ height: '400px', width: '100%', ...this.props.style }}
          ref="canvas">
        </canvas>
      </div>);
  }

  /* Signature Pad */

  addPoint(point) {
    /* Add pressure to Point */
    point.pressure = this.state.currentPressure;
    this.callbacks.onChange(point);

    /* Call original handler */
    return SignaturePad.prototype._addPoint.call(this.signaturePad, point);
  }

  clear() {
    this.signaturePad.clear();
  }

  resize() {
    // When zoomed out to less than 100%, for some very strange reason,
    // some browsers report devicePixelRatio as less than 1
    // and only part of the canvas is cleared then.
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    this.canvas.width = this.canvas.offsetWidth * ratio;
    this.canvas.height = this.canvas.offsetHeight * ratio;
    this.canvas.getContext('2d').scale(ratio, ratio);
    this.clear();
  }
}

PressureSignaturePad.propTypes = {
  style: PropTypes.object,
  onChange: PropTypes.func,
};

PressureSignaturePad.defaultProps = {
  style: null,
  onChange: null,
};

export default PressureSignaturePad;

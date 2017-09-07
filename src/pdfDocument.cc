//
// Created by red on 9/6/17.
//

#include "pdfDocument.h"

pdfDocument::pdfDocument(const CallbackInfo &callbackInfo)
    : ObjectWrap(callbackInfo) {
  _document = new PoDoFo::PdfMemDocument();
}

Napi::Value pdfDocument::Load(const CallbackInfo &info) {
  string filePath = info[0].As<String>().Utf8Value();
  originPdf = filePath;
  _document->Load(filePath.c_str());
  return Napi::Number::New(info.Env(), _document->GetPageCount());
}

Napi::Value pdfDocument::GetPageCount(const CallbackInfo &info) {
  if (_document == nullptr)
    return Napi::Boolean::New(info.Env(), false);
  int pages = _document->GetPageCount();
  return Napi::Number::New(info.Env(), pages);
}

Napi::Value pdfDocument::GetPage(const CallbackInfo &info) { return Value(); }

void pdfDocument::Write(const CallbackInfo &info) {
  string destinationFile = info[0].As<String>().Utf8Value();
  PoDoFo::PdfOutputDevice device(destinationFile.c_str());
  _document->Write(&device);
}

void pdfDocument::SetPassword(const CallbackInfo &info) {
  if (info.Length() < 1) {
  }
  string password = info[0].As<String>().Utf8Value();
  _document->SetPassword(password.c_str());
}

Napi::Value pdfDocument::GetVersion(const CallbackInfo &info) {
  PoDoFo::EPdfVersion versionE = _document->GetPdfVersion();
  double v;
  switch (versionE) {
  case PoDoFo::ePdfVersion_1_1:
    v = 1.1;
    break;
  case PoDoFo::ePdfVersion_1_3:
    v = 1.3;
    break;
  case PoDoFo::ePdfVersion_1_0:
    v = 1.0;
    break;
  case PoDoFo::ePdfVersion_1_2:
    v = 1.2;
    break;
  case PoDoFo::ePdfVersion_1_4:
    v = 1.4;
    break;
  case PoDoFo::ePdfVersion_1_5:
    v = 1.5;
    break;
  case PoDoFo::ePdfVersion_1_6:
    v = 1.6;
    break;
  case PoDoFo::ePdfVersion_1_7:
    v = 1.7;
    break;
  }
  return Napi::Number::New(info.Env(), v);
}

void CheckInfoArgsLength(const CallbackInfo &info, const int expectedLength) {
  if (info.Length() < static_cast<size_t>(expectedLength)) {
    stringstream ss;
    ss << "Expected " << to_string(expectedLength) << " args but got "
       << to_string(info.Length()) << endl;
    throw Napi::Error::New(info.Env(), ss.str());
  }
}

Napi::Value pdfDocument::IsLinearized(const CallbackInfo &info) {
  return Napi::Boolean::New(info.Env(), _document->IsLinearized());
}
